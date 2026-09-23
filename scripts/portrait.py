"""Turns the two drawings of David into flat vector prints of the page.

The illustrations arrive as full-colour pictures. On a page built out of four
colours that reads as something stuck on, however good the picture is — and a
picture also has a resolution, so it is soft at one size and heavy at
another. This traces them instead: the brightness of the drawing is cut into
bands, each band becomes an outline, and each outline is filled with a colour
read out of theme.css.

What that buys, all at once:

  sharp        an outline has no resolution, so it is right at 124px on a
               phone and at 216 on a desktop.
  light        about 17 KB each, compressed, against 30 of WebP, and only
               the one the current theme asks for is ever fetched.
  the page's   the fills are the theme's own roles, so the drawings cannot
  colours      drift out of step with the palette: a change to theme.css is
               a re-run of this script.

One region per drawing keeps a colour of its own, in the accent: the body of
the open shirt by day, the lit screen at night. A print with one spot
colour is a print; two is a poster.

    pip install pillow scikit-image scipy fonttools
    python scripts/portrait.py

Writes public/hero/*.svg, one per theme, with that theme's colours in them.

Inlining them was tried and cost 13 KB over the JavaScript budget: a drawing
imported by a component is in the pre-rendered HTML *and* in the bundle React
hydrates with, so the page carries it twice. As files they are fetched once,
cached, and cost the script nothing. The colours are read from theme.css and
written in, which means a change of palette is a re-run of this script rather
than something the browser resolves — the trade for those 13 KB.
"""

import colorsys
import re
from pathlib import Path

import numpy as np
from PIL import Image
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from skimage import measure
from skimage.filters import gaussian
from scipy.ndimage import binary_fill_holes
from skimage.morphology import closing, dilation, erosion

SOURCE = Path('assets-source/hero')
OUT = Path('public/hero')
THEME = Path('src/styles/theme.css')

# Where one band of brightness ends and the next begins.
#
# Five. Three lost the outstretched arm on the light theme, where skin and the
# page were the same tone. Four lost the arms on the dark one, where the
# hoodie and the desk are both the darkest thing in the picture and fell into
# the same band: the extra cut down at 0.16 is what separates a sleeve from
# the table it rests on.
#
# The last one is 1.0 and not a hair less: a pixel brighter than the last cut
# belongs to no band, takes no fill, and lets the page show through the face.
# One drawing stands in daylight and the other sits in a dark room, so they
# do not share a set of cuts. The day one needs four: line, shadow, skin,
# white. The night one needs a fifth down at 0.16, because there the hoodie
# and the desk are both the darkest thing in the picture and without it the
# arms disappear into the table.
DAY_CUTS = (0.26, 0.56, 0.82, 1.0)
NIGHT_CUTS = (0.16, 0.34, 0.58, 0.82, 1.0)

# The drawings carry a white sticker outline. On cream it passes for the page
# and is left alone — cutting it there took white out of the face with it. On
# the dark theme it is a halo around the figure, so there it goes, and only
# from the pale bands.
#
# Taking it out of the silhouette instead was tried and cost the sun its rays:
# erode a drawing by nine pixels and anything thinner than nine pixels stops
# existing. The halo is pale by definition, so removing it from the pale bands
# reaches all of it and touches none of the linework.
RIM = 9

# The blush on each cheek is darker than the skin around it, so a band edge
# runs straight through it and leaves two spots. Lifted to the skin's own
# level before the bands are cut, it stops being a shape at all.
BLUSH_LIFT = 0.14

# The brightness map is smoothed before it is cut. Without it a band edge
# wanders through the shading on a cheek and comes out as a rash of patches;
# with it the edge follows the drawing. Two pixels on a 1400px original is
# below anything the eye reads as a line.
SMOOTH = 2.0

# How far a traced outline may stray from the pixels, and the smallest shape
# worth keeping. Higher is simpler; past about 5 the eyes stop being eyes.
TOLERANCE = 3.0

# The smallest shape worth keeping. Low, and the highlights inside the hair
# come through as a rash of pale specks; high, and the eyes go with them.
MIN_AREA = 380

# How far round the accent's shapes the drawing is cut away when they go: the
# dark outline and the white rim the drawing gives them are about this wide.
ERASE_MARGIN = 25

# A tinted garment: the gaps its colour patches are closed over. How far the
# tint keeps inside the garment's edge is per drawing.
TINT_CLOSE = 21

# A button: a dark ring inside the tinted garment, this many pixels in area,
# and this round at least (0 is a circle, 1 a line).
BUTTON_AREA = (120, 2500)
BUTTON_ROUND = 0.8

# Written literally, so a shell heredoc cannot turn it into a real break.
NEWLINE = chr(10)


def palette():
    """The colour roles of both themes, as theme.css declares them."""
    css = THEME.read_text(encoding='utf-8')
    dark_at = css.index("html[data-theme='dark']")
    read_roles = lambda text: dict(
        re.findall(r'--color-([a-z]+):\s*(#[0-9a-f]{6})', text)
    )
    light, dark = read_roles(css[:dark_at]), read_roles(css[dark_at:])
    return (
        # Darkest band of the drawing first.
        {
            '--fig-1': light['ink'],
            '--fig-2': light['muted'],
            # Darker than the page on purpose: this is where skin lands, and
            # skin the colour of the paper is an arm nobody can see.
            '--fig-3': light['line'],
            '--fig-4': light['surface'],
            # Solarized's yellow, which the theme control already uses.
            '--fig-accent': '#b58900'
        },
        {
            # Darker than the page, so the figure sits in it, not on it.
            '--fig-1': '#14171d',
            # The desk and the chair, a step up from the sleeve on them.
            '--fig-2': '#262b33',
            '--fig-3': dark['line'],
            '--fig-4': '#6f7a88',
            '--fig-5': dark['muted'],
            '--fig-accent': dark['accent']
        }
    )


def read(path):
    pixels = np.asarray(Image.open(path).convert('RGBA')).astype(float)
    alpha = pixels[..., 3] / 255
    brightness = (
        0.2126 * pixels[..., 0] + 0.7152 * pixels[..., 1] + 0.0722 * pixels[..., 2]
    ) / 255
    # The blush: pink, gentle, bright. Lifted rather than recoloured — the
    # bands are cut on brightness, so brightness is where it has to stop
    # being different.
    red, green, blue = pixels[..., 0], pixels[..., 1], pixels[..., 2]
    top, low = np.max(pixels[..., :3], axis=2), np.min(pixels[..., :3], axis=2)
    span = np.where(top > 0, (top - low) / np.maximum(top, 1), 0)
    pink = (red >= green) & (green >= blue) & (span > 0.13) & (span < 0.55)
    brightness = np.where(pink & (brightness > 0.62), brightness + BLUSH_LIFT, brightness)

    # The white sticker outline: bright, and hard against the transparent
    # edge. Taken out of the figure, so neither theme inherits a halo.
    solid = alpha > 0.5
    inside = erosion(solid, footprint=np.ones((RIM * 2 + 1, RIM * 2 + 1)))

    # Outside the figure counts as paper, so the outline stops at the edge.
    field = np.where(solid, np.clip(brightness, 0, 1), 1.0)
    # Clipped *after* the blur as well as before it. A gaussian overshoots by
    # a few parts in a quadrillion, and the last cut is 1.0 exactly: without
    # this, 5,170 pixels of nose and mouth belonged to no band at all and the
    # page showed through the face.
    return (
        pixels,
        solid,
        np.clip(gaussian(field, sigma=SMOOTH), 0, 1),
        solid & ~inside
    )


def hue_mask(pixels, alpha, hues, saturation, value):
    """Everything in one corner of the colour wheel, bright enough to mean it."""
    low, high = hues
    mask = np.zeros(alpha.shape, dtype=bool)
    for y in range(mask.shape[0]):
        row = pixels[y]
        for x in range(mask.shape[1]):
            if not alpha[y, x]:
                continue
            r, g, b = row[x, 0] / 255, row[x, 1] / 255, row[x, 2] / 255
            h, s, v = colorsys.rgb_to_hsv(r, g, b)
            if low <= h * 360 <= high and s > saturation and v > value:
                mask[y, x] = True
    return mask


# Letters set in the site's own font, where a traced symbol cannot be read:
# the display cut, the one the name in the hero is set in.
FONT = Path('public/fonts/archivo-display.woff2')


def wordmark(text, box, slant=0.0, foreshorten=1.0):
    """`text` as paths, fitted to `box` and laid on a surface at an angle.

    The laptop in the night drawing has a `</>` on its screen, and traced
    the slash and the brackets merge into a blob that reads as a reversed S.
    It is set again from the outlines of the site's display cut — the same
    symbol the drawing shows, in the face the name is set in, crisp at any
    size — and put on the lid the way the lid is seen: leaning by `slant`
    degrees, like its sides, and squashed by `foreshorten`, as a surface
    turned away from the eye is.
    """
    font = TTFont(FONT)
    glyphs, widths = font.getGlyphSet(), font['hmtx']
    cmap, upem = font.getBestCmap(), font['head'].unitsPerEm

    drawn, advance = [], 0
    for character in text:
        name = cmap[ord(character)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        path = pen.getCommands()
        if path:
            drawn.append(f'<path d="{path}" transform="translate({advance} 0)"/>')
        advance += widths[name][0]

    left, top, right, bottom = box
    # Fitted to the width it is replacing, not to its height: the text is
    # wider than it is tall and the symbol it stands in for is a square-ish
    # box, so matching heights would push the mark off the side of the screen.
    scale = (right - left) / advance
    cap = font['OS/2'].sCapHeight * scale * foreshorten
    # Leaning moves the top of the letters sideways by half the lean over
    # their height; the mark is moved back by that much to stay centred.
    lean = np.tan(np.radians(slant))
    x = left - lean * cap / 2
    y = top + ((bottom - top) + cap) / 2
    return (
        f'<g fill="var(--fig-accent)" transform="translate({x:.1f} {y:.1f}) '
        f'skewX({-slant:.1f}) scale({scale:.4f} {-scale * foreshorten:.4f})">'
        + ''.join(drawn)
        + '</g>'
    )


def screen_glyph(mask):
    """The `</>` on the laptop screen, told apart from everything else lit.

    The accent catches three kinds of thing: the glow spilling off the screen
    onto the desk, which is long and thin and runs across the picture; the lit
    edge of the screen itself, which is large; and the symbol on the screen,
    which is small, compact, and over on the right where the screen is. The
    last is the only one that is all three, which is what this asks for.
    """
    height, width = mask.shape
    best = None
    for region in measure.regionprops(measure.label(mask)):
        top, left, bottom, right = region.bbox
        if not 40 <= right - left <= 170:
            continue
        if not 25 <= bottom - top <= 120:
            continue
        if left < width * 0.55 or region.area > 2500:
            continue
        if best is None or region.area > best.area:
            best = region
    return best


def outlines(mask, min_area=None):
    paths = []
    for contour in measure.find_contours(mask.astype(float), 0.5):
        polygon = measure.approximate_polygon(contour, tolerance=TOLERANCE)
        if len(polygon) < 4:
            continue
        x, y = polygon[:, 1], polygon[:, 0]
        area = 0.5 * abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))
        if area < (MIN_AREA if min_area is None else min_area):
            continue
        paths.append(smooth(np.column_stack((x, y))))
    return ' '.join(paths)


def smooth(points):
    """A closed outline as curves rather than a chain of straight segments.

    Traced to a polygon and drawn as one, every edge of the drawing was a
    run of short straight lines meeting at angles — visible as facets on a
    cheek or a curl the moment the picture is any size. Here each corner of
    the polygon becomes the control point of a quadratic curve that runs
    from the middle of one side to the middle of the next: the outline keeps
    its course and loses its corners, the way a pen would have drawn it.
    """
    if np.allclose(points[0], points[-1]):
        points = points[:-1]
    middles = (points + np.roll(points, -1, axis=0)) / 2
    start = middles[-1]
    curves = ''.join(
        f'Q{p[0]:.0f},{p[1]:.0f} {m[0]:.0f},{m[1]:.0f}'
        for p, m in zip(points, middles)
    )
    return f'M{start[0]:.0f},{start[1]:.0f}{curves}Z'


def trace(
    source,
    label,
    cuts,
    drop_rim,
    accent_hues,
    accent_saturation,
    accent_value,
    sign=None,
    erase_accent=False,
    tint=None
):
    pixels, alpha, brightness, rim = read(source)
    height, width = alpha.shape

    accent = hue_mask(pixels, alpha, accent_hues, accent_saturation, accent_value)
    mark, erase = '', None
    if erase_accent:
        # The accent's shapes leave the drawing altogether: taken out of every
        # band with the dark outline and the white rim that frame them, or
        # their silhouettes would stay behind as pale patches on the page.
        erase = dilation(accent, footprint=np.ones((ERASE_MARGIN, ERASE_MARGIN)))
        alpha = alpha & ~erase
        accent = np.zeros(accent.shape, dtype=bool)
    if sign:
        glyph = screen_glyph(accent)
        if glyph is not None:
            top, left, bottom, right = glyph.bbox
            lit = np.zeros(accent.shape, dtype=bool)
            lit[top:bottom, left:right] = glyph.image
            # The symbol has a dark outline as well as a lit body, and the
            # outline lives in the dark bands. Taking out only what is lit
            # leaves its shadow on the screen behind the mark; taking the
            # area out of every band left a hole the page showed through.
            # So the area is painted over with the screen's own tone — the
            # median of a ring just around it — and the bands are cut from
            # that, which leaves the lid whole under the new mark.
            area = dilation(lit, footprint=np.ones((9, 9)))
            ring = dilation(area, footprint=np.ones((9, 9))) & ~area & alpha
            brightness = np.where(area, np.median(brightness[ring]), brightness)
            accent &= ~area
            text, slant, foreshorten = sign
            mark = wordmark(text, (left, top, right, bottom), slant, foreshorten)

    layers = []
    for index, cut in enumerate(cuts, start=1):
        band = (brightness <= cut) & alpha
        if erase is not None:
            band = band & ~erase
        # The two darkest bands are the drawing's line; the rest are its
        # fills, and the halo is one of those.
        if drop_rim and index > 2:
            band = band & ~rim
        shape = outlines(band)
        if shape:
            layers.append(f'<path fill="var(--fig-{index})" d="{shape}"/>')
    # A garment in the accent: its whole shape, found by colour in the
    # original — patches closed into one shape, holes filled — and kept a
    # hair inside its edge. It is laid as a ground under the garment's
    # shadow and line bands, which then cover it where they fall: tracing
    # the colour as a shape of its own left slivers of the fill showing
    # between it and the rim, because two outlines traced apart never meet
    # exactly. Buttons, the small round rings inside the garment, are
    # filled in the colour of the rim, as solid dots.
    ground, dots = '', ''
    if tint:
        hues, saturation, value, band, edge = tint
        garment = hue_mask(pixels, alpha, hues, saturation, value)
        whole = binary_fill_holes(
            closing(garment, footprint=np.ones((TINT_CLOSE, TINT_CLOSE)))
        )
        inner = erosion(whole, footprint=np.ones((edge, edge))) & alpha
        shape = outlines(inner)
        if shape:
            ground = f'<path fill="var(--fig-accent)" d="{shape}"/>'
        dark = inner & (brightness <= cuts[band - 2])
        disks = np.zeros(dark.shape, dtype=bool)
        for region in measure.regionprops(measure.label(dark)):
            if BUTTON_AREA[0] <= region.area <= BUTTON_AREA[1] and (
                region.eccentricity <= BUTTON_ROUND
            ):
                top, left, bottom, right = region.bbox
                disks[top:bottom, left:right] |= binary_fill_holes(region.image)
        # Smaller than the smallest shape kept elsewhere: a button is a
        # dot, and the floor that clears specks out of the hair would take
        # every one of them.
        shape = outlines(disks, min_area=BUTTON_AREA[0])
        if shape:
            dots = f'<path fill="var(--fig-{band - 1})" d="{shape}"/>'
    spot = outlines(accent)
    # Lightest band first. The tint goes under band `band - 1` and the ones
    # darker than it, so those draw over it; its buttons go on top of the
    # shadows and under the line.
    under = list(reversed(layers[band - 1 :])) if tint else list(reversed(layers[1:]))
    over = list(reversed(layers[1 : band - 1])) if tint else []
    body = (
        ''.join(under)
        + ground
        + ''.join(over)
        + dots
        + ''.join(layers[:1])
        + (f'<path fill="var(--fig-accent)" d="{spot}"/>' if spot else '')
        + mark
    )
    ys, xs = np.nonzero(alpha)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    print(f'{label}: {len(body):,} bytes, {len(layers)} bands')
    return body, box


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    light, dark = palette()
    # Per drawing: its source, its file, its name, its cuts, whether it drops
    # the rim, its colours, the accent's hues and brightness floor, the text
    # set on the screen in place of a traced symbol (with its lean and its
    # foreshortening), whether the accent's shapes are erased, and which
    # garment (hues, saturation, brightness, band, edge margin) takes the
    # accent under that band and the darker ones.
    drawings = (
        (
            'david-wave-source.png',
            'david-wave.svg',
            'Drawing of David Cohen greeting the day',
            DAY_CUTS,
            False,
            light,
            (35, 70),
            0.55,
            None,
            # The sun and the three strokes by the hand said "hello" twice
            # beside a drawing that already waves. They go; their colour
            # stays, in the body of the open shirt, so the figure keeps the
            # one warm note the page gives it.
            True,
            # The blue-green shirt: its fill and highlights (the third cut and
            # up), and not its border — the outline and the rim stay the
            # drawing's, and so do its shadows. The fill never touches the rim, so it needs only a
            # hair of margin from the garment's edge.
            ((165, 215), 0.12, 0.2, 3, 5)
        ),
        (
            'david-working-source.png',
            'david-working.svg',
            'Drawing of David Cohen at his desk',
            NIGHT_CUTS,
            True,
            dark,
            # The lit screen. The hoodie, the desk and the chair are blue too,
            # but dark, so brightness separates what is lit from what is not.
            (185, 255),
            0.52,
            # The screen keeps what the drawing put on it — `</>` — set again
            # in the site's display cut, because traced it was a blob, and
            # laid on the lid in its perspective: the lid's sides lean about
            # 17° and it is seen a little from above. Swapping in the site's
            # wordmark was tried and read as a logo dropped into a picture:
            # the drawing already says what he is doing.
            ('</>', 17.0, 0.86),
            False,
            None
        )
    )
    traced = []
    for (
        source,
        name,
        label,
        cuts,
        drop_rim,
        colours,
        hues,
        floor,
        sign,
        erase_accent,
        tint
    ) in drawings:
        body, box = trace(
            SOURCE / source,
            label,
            cuts,
            drop_rim,
            hues,
            0.35,
            floor,
            sign,
            erase_accent,
            tint
        )
        traced.append((name, label, colours, body, box))

    # One canvas, and the same figure height on it.
    #
    # The day drawing is a standing figure and the night one a scene with a
    # desk in it, so left at their own sizes the second looks smaller than
    # the first — they are swapped in the same box, and a box filled to 77%
    # of its height reads as a smaller drawing. Each is scaled so its content
    # is exactly as tall as the other's, and the canvas is as wide as the
    # widest of them once scaled. Free, now that these are outlines: a vector
    # enlarged is still a vector.
    height = max(box[3] - box[1] for _, _, _, _, box in traced)
    width = max(
        round((box[2] - box[0]) * height / (box[3] - box[1]))
        for _, _, _, _, box in traced
    )

    for name, label, colours, body, box in traced:
        scale = height / (box[3] - box[1])
        left = (width - (box[2] - box[0]) * scale) / 2
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg"'
            f' viewBox="0 0 {width} {height}"'
            f' role="img" aria-label="{label}" fill-rule="evenodd">'
            f'<g transform="translate({left:.1f} 0) scale({scale:.4f})'
            f' translate({-box[0]} {-box[1]})">{body}</g></svg>'
        )
        for token, value in colours.items():
            svg = svg.replace(f'var({token})', value)
        (OUT / name).write_text(svg, encoding='utf-8')
    print(
        NEWLINE
        + f'Both drawings on {width}x{height}. '
        + f'styles/portrait.css wants aspect-ratio: {width} / {height}.'
    )


if __name__ == '__main__':
    main()
