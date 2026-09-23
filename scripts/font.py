"""How public/fonts/archivo-88.woff2 was made, and how to make it again.

Archivo ships as a variable font with two axes, weight and width, and weighs
90 KB. The page uses one width and never animates it, so the width axis is
dead weight: pinning it at 88% and keeping only the weights leaves 36 KB, and
nothing on the page changes.

It also prints the numbers in styles/fonts.css. The fallback face has to be
the same size on the screen as the real one, or the text reflows the moment
the font arrives and the page's CLS stops being zero. Those numbers are
measured here rather than guessed: the average advance width of Archivo at
this width against the average advance width of each fallback, over the
letters and the space in the proportion English uses them.

    pip install fonttools brotli
    python scripts/font.py

Requires the npm package as the source:

    npm install --no-save @fontsource-variable/archivo

Archivo is under the SIL Open Font License 1.1; the licence travels with the
file in public/fonts/archivo-LICENSE.txt, which is a condition of using it.
"""

import string
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SOURCE = Path(
    'node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'
)
OUT = Path('public/fonts/archivo-88.woff2')
LICENCE = Path('public/fonts/archivo-LICENSE.txt')
WIDTH = 88

# The weights the page reads at: 400 body, 500 and 600 titles, 700 the name.
# Carrying 100 to 900 costs 3.4 KB for weights nothing asks for.
WEIGHTS = (400, 700)

# Latin-1 covers English and every Western European name the sources can hand
# us — authors come from Crossref, and a missing glyph there would print as a
# blank box in somebody's surname. Then the marks the page sets itself.
#
# Asking for a character Archivo does not have costs nothing; dropping one it
# does have costs a glyph in a face of its own. Keeping this list in step with
# the pages is what `python scripts/font.py --check` is for: it reads the
# built pages and names anything they set that this file would leave out.
CHARACTERS = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + [0x2018, 0x2019, 0x201C, 0x201D, 0x2013, 0x2014, 0x2022, 0x00B7,
       0x00D7, 0x2190, 0x2191, 0x2192, 0x2197, 0x2264, 0x2265, 0x20AC,
       0x2026, 0x2082]
)

# Letters, and the space weighted the way running text uses it: roughly one
# space every six characters, which is what decides an average line's length.
SAMPLE = string.ascii_letters + ' ' * 18 + '.,'

FALLBACKS = [
    ('Arial', 'C:/Windows/Fonts/arial.ttf'),
    ('Segoe UI', 'C:/Windows/Fonts/segoeui.ttf')
]


# The display cut: the same Archivo, at the narrow end of its width axis and
# at one heavy weight. It sets the name, the section numbers and the figures a
# project is remembered by — a handful of words, so a handful of glyphs: the
# ASCII letters, the digits and the marks a figure is written with. A title
# from an API never reaches it, which is why Latin-1 is not needed here.
DISPLAY_OUT = Path('public/fonts/archivo-display.woff2')
DISPLAY_WIDTH = 62
DISPLAY_WEIGHT = 800
DISPLAY_CHARACTERS = list(range(0x20, 0x7F)) + [
    0x00B7, 0x00D7, 0x2013, 0x2014, 0x2019, 0x2192, 0x2248
]


def average_width(font):
    cmap, hmtx, upem = font.getBestCmap(), font['hmtx'], font['head'].unitsPerEm
    widths = [hmtx[cmap[ord(c)]][0] / upem for c in SAMPLE if ord(c) in cmap]
    return sum(widths) / len(widths)


def main():
    font = TTFont(SOURCE)
    instancer.instantiateVariableFont(
        font, {'wdth': WIDTH, 'wght': WEIGHTS}, inplace=True
    )
    options = subset.Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    trimmer = subset.Subsetter(options=options)
    trimmer.populate(unicodes=CHARACTERS)
    trimmer.subset(font)
    font.flavor = 'woff2'
    OUT.parent.mkdir(parents=True, exist_ok=True)
    font.save(OUT)
    print(f'{OUT}: {OUT.stat().st_size / 1024:.0f} KB, axes '
          f'{[a.axisTag for a in font["fvar"].axes]}')

    # Fully static: one width, one weight, no axes left to carry.
    display = TTFont(SOURCE)
    instancer.instantiateVariableFont(
        display, {'wdth': DISPLAY_WIDTH, 'wght': DISPLAY_WEIGHT}, inplace=True
    )
    trimmer = subset.Subsetter(options=options)
    trimmer.populate(unicodes=DISPLAY_CHARACTERS)
    trimmer.subset(display)
    display.flavor = 'woff2'
    display.save(DISPLAY_OUT)
    print(f'{DISPLAY_OUT}: {DISPLAY_OUT.stat().st_size / 1024:.0f} KB')

    # The metrics of the text weight, which is what the fallback has to match.
    text = TTFont(SOURCE)
    instancer.instantiateVariableFont(
        text, {'wdth': WIDTH, 'wght': 400}, inplace=True
    )  # the text weight, which is what the fallback has to match
    upem = text['head'].unitsPerEm
    ascent = text['OS/2'].sTypoAscender / upem
    descent = -text['OS/2'].sTypoDescender / upem
    reference = average_width(text)

    print('\nstyles/fonts.css should say:')
    for name, path in FALLBACKS:
        try:
            adjust = reference / average_width(TTFont(path, fontNumber=0))
        except OSError:
            print(f'  {name}: not installed here, leaving its numbers alone')
            continue
        print(f'  {name}: size-adjust {adjust * 100:.1f}% · '
              f'ascent-override {ascent / adjust * 100:.1f}% · '
              f'descent-override {descent / adjust * 100:.1f}%')

    if not LICENCE.exists():
        raise SystemExit(
            f'{LICENCE} is missing: the OFL requires the licence to ship '
            'with the font.'
        )


def check():
    """Name every character the built pages set that the font would not have.

    Only the ones Archivo itself carries: a page may well use a mark no Latin
    font has — an arrow, a Greek letter — and the browser falls back for it,
    which is ordinary and invisible. What matters is never dropping a glyph
    the face does have.
    """
    import re
    import unicodedata

    source = set(TTFont(SOURCE).getBestCmap())
    kept = set(CHARACTERS)
    used = set()
    for page in Path('build').glob('*.html'):
        text = re.sub(
            r'<script.*?</script>|<style.*?</style>|<[^>]+>',
            ' ',
            page.read_text(encoding='utf-8'),
            flags=re.S
        )
        used.update(ord(c) for c in text)

    dropped = sorted(c for c in used & source if c not in kept)
    for code in dropped:
        try:
            name = unicodedata.name(chr(code))
        except ValueError:
            name = 'unnamed'
        print(f'  U+{code:04X}  {name}: in Archivo, not in CHARACTERS')
    print(f'{len(dropped)} glyph(s) the pages use and the subset drops')
    return 1 if dropped else 0


if __name__ == '__main__':
    import sys

    raise SystemExit(check() if '--check' in sys.argv else main())
