# Decisions

The choices that still hold, each with the measurement or the report that
settled it. The day-by-day record is in `audit-2026-09-18.md` and
`audit-2026-09-22.md`; this is the short version, for someone deciding whether
to change one of them.

## The page

**One kind of object.** A project and the publication are the same entry —
what it is and when, a title, a picture, a figure, a sentence, tags, links — so
a reader learns the shape once. The shared class lists live in `ui/Entry.tsx`;
the two sections cannot drift apart a utility at a time.

**Two layouts, one entry.** An entry is laid out as a `tile` or a `row`,
and the section chooses. Projects are tiles in a grid of two: a set of
modules, none of them the whole page, so a new kind of thing can sit beside
them without the page being rebuilt around one project. A lead project the
width of the column was tried and taken out for that reason. The publication
is a row, in the CV's grammar — a rail for the date, the kind and the figure,
the prose beside it — because it is a record to read rather than a set to
browse. The pieces (`EntryMeta`, `EntryMetric`, `EntryTags`…) are the same in
both; they read the layout off the entry and place themselves.

**A figure on every card.** A project was introduced by its GitHub
description, and the flagship's is *"A robotics simulator written in scala."*
The sentences that make a project memorable — 43M → 32 states, 7× faster than
real time, 0 collisions — were already signed in the CV and printed nowhere
else. They are in `content/metrics.ts` now, printed on the card in the display
face and the colour of a result, and the only words on a card that did not
come from a record. Each has two labels: the CV's full sentence, and a few
words for the card — the details are the CV's job. They live apart from `cv.ts` because
importing that file for five figures put every sentence of the CV in the
page's JavaScript: 1.5 KB of a budget with 2.3 left.

**A card needs a picture.** Pinned first was the rule, and the pins put two
repositories with no picture on cards and kept the one on PyPI folded away.
The repositories with a picture are eligible; pins, then the configured
order, decide among them, and `featured` (4, so the grid of two closes on a
full row) says how many.

**One left edge on a phone.** The entries were centred on a phone except for
their sentence, which gave each entry two axes. Everything is left-aligned
now, in reading order: kind and date, title, picture, figure, prose.

**No icon tiles.** A section heading carried an icon in a tile, an entry an
icon in its meta line, and every datum a glyph: the idiom of a dashboard, and
none of them said more than the word beside it. A section is numbered instead,
01 and 02, in the display face — a number says where a reader is in a
sequence. Tags stay in their pills: a pill is what says "tag" at a glance, and
setting them as mono text with dots between them made them read as a
sentence.

**Publication, not Achievements.** One record under a plural heading, followed
by a dashed slot saying "In preparation", made the page's strongest credential
read as a shortage. The section is named for what it is, the slot is gone, the
journal is the figure, and the byline is printed in full with David's name in
the ink — where he stands in it, without a word added.

**Nothing scrolls inside the page.** The projects were once a pane with a scroll
of its own, and a reader who reached the last one found the page still behind
it. A test now fails if anything inside `main` scrolls on its own.

**No index of five names.** It was a table of contents for a list you can see
the whole of, and it scrolled away exactly when it might have been wanted. The
menu at the top marks the section being read and stays.

**Grounds alternate between widgets, not inside them.** Striping alternate
entries says something untrue about them: inside a widget every entry is the
same kind of thing. A hairline separates entries; a change of ground separates
sections.

**A project links to its records the same way.** A module shows GitHub and,
where `content/project-links.ts` names them, the project's other records —
the SRS experiment notebook — each as a label and a link. The card used to
carry a "Case study" link of its own kind; every module now has one grammar
for its links.

**The CV is the same site.** It used to carry a stylesheet of its own — its
own greys, its own blue, Segoe UI, light only — so the one page a reader is
most likely to open looked like it came from somewhere else. It now wears the
site's tokens, its five sizes and both its themes, and it opens in whichever
theme the visitor left the portfolio in. What it does not share is the layout:
a CV is scanned down its left edge, so the dates sit in a column of their own,
and on paper that column collapses because there a quarter of the measure
spent on four words costs five extra sheets.

**No word is written in a component.** A string in JSX is a string nobody
else can reuse, find or translate, and it dies with the markup around it.
The interface's own words — section names, links, landmarks, what a screen
reader hears — are in `content/copy.ts` (what the portfolio says) and
`content/document-copy.ts` (what only the CV and the 404 say). They are two files because the first is in the page's JavaScript and
the second costs it nothing; one file put 0.4 KB of words the page never shows
into a budget with 2 KB left. The documents' script is handed the theme
control's two names as data attributes by the markup, so it keeps no words
of its own either.

**No case study.** There was one, for the simulator — a page of its own
with the run, the screenshot, the results and their limits, drawn by a
generic renderer from typed data. Its module now links the experiment
notebook like any other record, so the page was reachable from nowhere but
the sitemap, and it was removed with everything that existed only for it:
the renderer, its data and types, its stylesheet, its screenshot and its
article metadata. The site is two pages. The detail lives in the CV and in
the notebook itself; git history keeps the page if it is ever wanted back.

**The button behaves like a key.** It was a block of ink with an icon at
each end, which read as a banner and answered the pointer with nothing. It is
the words and an arrow now, standing on a hard shadow in the colour of a
result: it rises a pixel under the pointer, the arrow moves towards where it
goes, and it goes down onto the shadow when pressed.

**A capability is checked, never assumed.** Copying used the Clipboard API
alone, which exists only in a secure context, so on a page opened over plain
HTTP at an address the button did nothing and said nothing. Copying is its
own module now (`ui/clipboard.ts`): the API where it exists and answers, the
older copy command otherwise, and a result that says whether it worked. The
browser is passed in, so each path — including the one that shipped broken —
has a unit test. Its feedback is a hook (`ui/use-copy.ts`), whether the page
is live is another (`ui/use-hydrated.ts`), and `CopyButton` is only how it
looks. The same rule holds everywhere the page reaches for something a
browser may not have: view transitions, the Navigation API, speculation
rules, IntersectionObserver, idle callbacks, storage — each is checked where
it is used, and the page does without.

**One behaviour, one implementation.** The static documents had a script of
their own, written by hand, that did again what the portfolio's hooks did —
the theme (its storage key, its colours, its reveal), the menu that follows
the page, the control that asks to be pressed — and the copies had already
drifted: the menu marked its section at a different line, and the first
entry by default. Each behaviour is written once now, as plain DOM that
returns its own undoing (`theme/theme.ts`, `layout/scroll-spy.ts`,
`layout/asking.ts`); the portfolio's hooks are a line around them, and the
documents run them from `documents/client.ts`, a TypeScript entry Vite builds
alongside the portfolio — 0.3 KB, no framework. The script that sets the
theme before the first paint is compiled from `theme/boot.ts` with the same
module, so the storage key exists once. Whether motion is allowed is asked in
one place, `motion/raf.ts`.

## Type and colour

**Five reading sizes, and one display size.** The page had nine, five of them
between 11 and 16 px. Sizes that close do not make a hierarchy, they make a
blur. 13, 15, 17, 22, 34 — declared in `theme.css`, with everything Tailwind
ships above them set to `initial`, so a sixth size has to be a decision. The
sixth was one: capped at 34px, the name was a step above a project's title and
nothing on the first screen outranked anything else. `--text-display` (56 to
112px) is set only in the display face, only for the name and the case
study's headline.

**Three registers, one family.** Archivo at 88% of its width reads the prose;
the monospace stack keeps what is machine-read — dates, versions, tags, "checks
passing" — so the two registers are told apart by the typeface instead of by
another colour. The third is Archivo again at 62% and weight 800, for the
name, the section numbers and the figures: 8 KB of ASCII made by
`scripts/font.py`, and the one face that is preloaded, because the name set in
it is what LCP measures (2,195 ms against 2,500 on the simulated phone, CLS 0).
Its colour, when it is a figure, is `--color-result`: the gold of the theme
control, the shadows of the drawing's shirt, the light the simulator's robot seeks. It is served from this origin, never from a font CDN, and the
width axis is pinned at build time: 36 KB instead of 90, for a width the page
never animates. Its fallback is measured to the same average width and given
the same ascent and descent, so the swap moves nothing and CLS stays 0.

**The drawings are traced, not placed.** A full-colour illustration on a page
built out of four colours reads as something stuck on, however good it is, and
a picture also has a resolution — soft at one size, heavy at another.
Repainting the pixels was tried twice and lost both times: by region, which
fills the hair with speckles, and by a ramp, which is a picture of the page's
colours rather than the colours themselves. They are traced now. Three bands
of brightness, three outlines, and the fills are custom properties: the theme
does not choose between two pictures, it tells one picture what colour to be.
17 KB of markup each, compressed,, no request, sharp at every size, and a change to
theme.css reaches them with nothing to regenerate.

**The day drawing has no sun.** The sun and the three strokes by the hand
said "hello" twice beside a figure that already waves. They are erased in the
tracing (`scripts/portrait.py`, `erase_accent`) — out of every band, with the
outline and the white rim that framed them, so no pale shape is left where
they were — and their gold moves into the body of the open shirt (`tint`),
while its outline, its rim, its shadows and its buttons stay the drawing's.
Two tries went wrong first. Tinting the shadow band caught the thin rim that
runs along the outline and drew a gold contour; tracing the gold as a shape
of its own left slivers of the old fill between it and the rim, because two
outlines traced apart never meet exactly. So the shirt is found by colour,
closed into one shape, and laid as a gold ground *under* its shadow and line
bands, which cover it where they fall; its buttons — small round rings inside
it — are filled in the rim's colour. The night drawing is untouched (it
differs from the last trace by rounding, 0.04% of its pixels). The canvas
shrank with the sun, to 1112 × 1355, and portrait.css follows it.

**The drawings are drawn in curves.** Traced to polygons and drawn as
straight segments, every edge was a run of facets — a cheek, a curl, the eyes
— as soon as the picture was any size, in both themes. Each corner of the
traced polygon is now the control point of a quadratic curve from the middle
of one side to the middle of the next, so an outline keeps its course and
loses its corners (`smooth` in `scripts/portrait.py`). It costs weight: about
17 KB each compressed, from 9, and only the drawing the theme asks for is
fetched. The symbol on the night laptop, which traced as a blob, is set again
as `</>` in the display cut the name is set in, leaning and foreshortened
like the lid it is on; the lid under it is painted with the lid's own tone
rather than cut out, which had left a dark patch behind the mark.

**The one small story the page tells.** Pressing the theme control cracks the
sun and sits David down at his laptop. It is the only animation that is not a
response to scrolling, and it is allowed for the same reason the others are:
somebody asked for it by pressing something.

**The typeface is an enhancement, not a condition.** Preloading it cost about
630 ms of LCP on a CPU-throttled runner — the file is fetched at high priority
in front of the picture the metric is measuring — and left 14 ms of margin
against a 2,500 ms budget. It is not preloaded now: whoever has it cached
reads the page in Archivo, whoever does not reads it in a fallback of the same
width with the same line breaks, and sees Archivo next time. `font-display:
optional` is what makes that safe, because it never swaps the text out from
under a reader. `swap` was measured too and costs 0.025 of layout shift: a
fallback can match an average width, not every string's.

**A band, not a stripe.** Sections alternate between the page and
`--color-band`, which is 1.045:1 against the page in the light theme and
1.096 in the dark — the quietest step that still reads as a change of ground,
where the wash is 1.14 and would have made the page a set of stripes. Two dark
grounds this close tell apart less easily than two light ones, which is why
the dark theme's step is the larger of the two. It does not print.

**Crossed is not reached.** A clip has to be the most visible one for 220 ms
before it is fetched. Scrolling the length of the page drags every clip
through the threshold on the way, and without the wait, passing one at speed
was enough to start downloading it — which showed up the day a change to the
hero altered how the page scrolls.

**Nothing starts on the first screen, clips included.** A clip that is already
in view has not been reached, it has been landed on. When the change of
typeface shortened the page, the first clip came inside the play threshold at
load and put 176 KB on a page that weighs 240: the visit doubled its carbon
before the visitor had decided to stay. A clip now waits for the first scroll.

**Two named themes.** Solarized Light and One Dark, by their own values. Four
are adjusted and each says why in the file: a lifted surface, because cards sit
on the page; a darker blue and green, because Solarized's are 3.4:1 and 3.0:1 on
base3 and links are body text; a lighter grey in the dark theme, because One
Dark's comment grey is 2.3:1.

**A colour is measured against the ground it lands on.** The signal green passed
on the page and on the wash and still failed at 320 px: axe measured 4.09:1
against a tag's own fill, which is darker than either.

## Motion

**Nothing moves without being scrolled to.** The theme control asks to be
pressed until it has been pressed once — and it asks in the reader's own
time: the strength of its glow is a function of how far down the page is, so
it rises going down and falls coming back up, and a page standing still
leaves it standing still. On a timer it was motion the page had not earned;
on the scroll it is the same rule as everything else here. It ends at the
first press, on that visit and on every later one, because the choice is read
before the first paint.

The value is written on the button and nowhere else. A custom property on
`:root` restyles the whole document every frame, which cost 70ms of blocking
time when it was last measured here.

**The menu follows the page sideways.** On a phone the menu is wider than the
screen, so marking the current section is not enough on its own: the mark can
be off the edge. The strip scrolls to keep it in view, which is the only way
a menu can answer "where am I" on a narrow screen.

**The theme control is a small sky.** The sun and the moon sit on a wheel
that turns under a horizon drawn across the disc, so a press is a sunset or a
sunrise, on a spring that carries the body past the top and back; under the
pointer the wheel leans and the sun starts down. The sky is warm by day and
dark with three stars by night. It all hangs off `data-theme`, so the
prerendered page, the hydrated one and the static documents draw the same sky
from one component (`ui/ThemeDial.tsx`) and no script decides it. The crack
that each press adds is kept: it is the page's one joke.

**The dial asks, crisply.** Its gold ring is back — it is what makes the
control look worth pressing — but drawn as an outline a few pixels off the
disc, which follows the curve and is antialiased like any line, instead of a
gradient cut out with a mask. It thickens with `--ask` going down the page,
opens out under the pointer and closes in when pressed. The disc has no
sky: a tinted gradient behind the bodies made it a sticker on the bar, so it
is the header's own flat ground, with a hairline horizon. The sun and the moon
are solid shapes — a disc with short round rays, a filled crescent — because
hairline outlines with a break drawn in them read as a broken icon at 20px;
the crack is cut into the fill in the page's colour.

**One line, drawn one way.** Every edge on the page is a solid hairline:
the round controls share a `round-control` utility (border, accent under the
pointer, down a pixel when pressed), the progress round the way back is an
SVG stroke, and every picture — screenshot, terminal, paper — wears the same
corners and a 1px frame. Rings cut out of gradients with masks, a halo, and a
blurred pool of shadow under each picture were all taken out: each had a
softer, grainier edge than everything around it.

**A theme opens from the control.** The new theme is revealed through a circle
growing from the centre of the button to the farthest corner — a view
transition, so the old page is a still picture underneath and nothing is
animated by hand. Where the API is missing, or motion is turned down, the
switch is instant. The elements that travel between pages are unnamed for
its length, or they would cross-fade outside the circle.

**The circle holds everything else still.** On a phone the change of theme
started slow and lurched at the end. Under a view transition the new page
is a live picture: anything that moves in it makes the browser repaint the
whole picture every frame, and two things did — the portrait's fade and the
dial's turn. The portrait no longer fades while the circle opens (the
circle is the change), the dial is lifted onto a layer of its own for the
length of it, and the circle itself is animated with the Web Animations API
from plain pixel values, on a curve that starts fast and settles, instead of
a CSS keyframe reading custom properties.

**Things answer the pointer, each in its own way.** The hero's grid lights up
in the drawing's gold under the pointer — the arena, lit by the reader
(`motion/use-pointer-light.ts` says where, the stylesheet decides what). A
module's title and its frame take the accent when it is pointed at; the menu
previews its mark; the fold's `+` turns into a cross. The paper's first page
does not move: a sheet tilting under the pointer read as a game, not as a
record. The e-mail address can be copied,
because a mail link opens whatever mail program the machine has, which is
often none. The way back to the top wears a ring of how much of the page is
behind. None of it moves on its own, and none of it on a touch screen or with
motion turned down.

**Tags filter.** A tag on a project's module is a button: pressed, the
projects narrow to those that share it — the modules and the rows under "Also
on GitHub", which opens on the matching ones — and a line above them names the
filter, counts what is left and offers "Show all". The filter is in the
address (`?tag=robotics`), so a view can be linked to; it replaces the entry
rather than pushing one, so the back button still goes where it did. Tags are
24px tall now, the least a pointer should have to hit.

**Copying says so.** Copying the e-mail address or the paper's citation turns
the icon into a tick and raises a small "Copied" note over the button, which
fades after a moment; a screen reader hears the same word. The note is in the
page only while it is shown and grows leftwards from the button, so it never
sticks out past a narrow screen. The citation is BibTeX built from the
Crossref record (`domain/achievement.ts`), keyed the way reference managers
key it.

**The headings no longer lag the scroll.** Six pixels of drift on a fast
scroll read as a stutter, not as weight, and it was the one motion on the page
that answered nothing. `motion/use-air.ts` is gone.

**The lift works, and a clip does not lift.** A project's picture rises 3px
under the pointer — which it had not done for some time, because the selector
looked for the frame inside the cover and the two are the same element. A clip
is excluded: it is a control, and a control should not move under the pointer
about to press it.

**Stopping a clip is asking for stillness.** With two cards on the screen at
once, stopping one started the next. Nothing now starts by itself while the
clip that was stopped by hand is still in front of the reader.

**Motion turned down still has no grey bar.** With reduced motion or on a
metered connection nothing plays by itself; the clip used to keep the
browser's control bar there, on every card. It now shows a play mark over the
poster and plays once on a click or Enter.

**The first screen does not animate.** Animating what is already on screen at
load cost 95 ms of blocking time against 0 — and it was the wrong idea anyway:
the first screen was not arrived at.

**No CSS scroll-driven animation.** Measured at 85 ms of blocking time against 3
ms without it: the browser resolves the timeline during load whether or not
anyone scrolls. A passive listener costs nothing until the page moves.

**A clip plays when it is reached, one at a time, never with motion turned down,
never on a metered connection.** Nothing is fetched until a clip is nearly on
screen, which is how the page loads in 171 KB with three videos in it.

**The clip is its own control.** The native bar is grey furniture in the
browser's idiom sitting on a card, over the picture it belongs to, and it is
there on every card at once. It comes off in the hook rather than in the
markup: a click or Enter on the clip stops it, scrolling past it stops it, and
a clip stopped by hand stays stopped until it leaves the screen. Without
JavaScript nothing plays by itself, so there the bar stays — it is the only
way to see the clip at all, and the no-JS test checks that it is still
there.

**No page is waited for.** Every page carries speculation rules
(`scripts/page-scripts.ts`, one list for all of them): the other pages of the
site are prefetched at once — about 20 KB of HTML over a stylesheet already
in the cache — and the page behind a link the pointer rests on is
prerendered, so following it is a swap, not a load, in Chromium browsers;
elsewhere a short script falls back to `<link rel="prefetch">`. A
prerendered page reads the theme again when it is shown, in case it was
changed while the page waited. A service worker was considered and left
out: the site is re-synced every half hour, and a cache that can outlive the
page it serves is a second source of truth to keep honest. The development
server is slower than all of this by design — it renders the CV on each
request — so the measure is the built site.

**A link to where you came from goes back.** From the CV, "Portfolio" was a
new load of a page the browser still had; now, when the link points at the
page just left, the click goes back through history, and the page comes from
the back-forward cache as it was left, scroll included. "Just left" is the
entry before this page's first one: the way back to the top and the menu's
anchors add entries of their own, and the first version, which went back a
single step on the strength of the referrer, landed at the foot of the CV
instead of on the portfolio. The Navigation API lists the entries and the
click traverses past them; without it, the shortcut holds only until the
first jump inside the page. Any other link behaves as a link.

**The corner controls are one element.** The way back to the top existed
twice — a React component on the portfolio and markup written again in the
CV — with its arrival and its ring driven by two scripts, and on the CV the
ring was drawn against the wrong box. It is `ui/Floating.tsx` now, used by
the portfolio and the CV, and its
behaviour belongs to the element: the markup says `data-floating` and
`data-scroll-progress`, and the one inline script every page carries
(`layout/page.ts`, compiled inline) does the rest, hydrated page or static.

## Data

**Everything outside the hero and the footer is extracted.** A project's name is
the first heading of its README; its category, its tags and its years come from
GitHub; the paper's title, journal, authors and citations from Crossref, its
abstract from OpenAlex. This used to be enforced by REQ-SRC-1, a scan for
sentences outside a list of files; it was dropped as heavier than the rule it
kept, which is now a convention (see CONTRIBUTING).

**A source that is down leaves yesterday's value.** Field by field, with a line
on stderr saying what was kept. A page showing a figure from an hour ago is
right; a page showing nothing because a third party was down is not.

**A fetched figure is credited to whoever counted it.** "Cited 2 times ·
Crossref", not "cited 2 times".

**Read at build time, never in the browser.** The page makes no third-party
request, and `REQ-PRIV-1` fails if one appears.

## Process

**The tests are few and strong.** Sixteen unit tests and nine browser checks. A
test earns its place by protecting a promise nothing else catches; the 5 × 2
matrix that ran the same stylesheet ten times was cut to its two edges.

**A test checks a contract, never a sentence.** A test that names a project,
a job title or a row of a table breaks when the content moves and says
nothing about the code, and it quietly makes the content hard to change. The
browser tests read what they need from the modules — the labels from
`content/copy.ts`, the name from the profile —
and assert structure: one title, a named table, no violation, nothing
fetched. Removed with that rule: the component tests of `App` (six checks,
each a copy of a browser test or of a string on the page, and the only reason
for jsdom and Testing Library), the pixel baselines (Windows-only, skipped
elsewhere, and invalidated by every design change), and two regression guards
that pinned a class name and a menu's labels.

**Requirements have thresholds and a scoreboard.** `REQUIREMENTS.md` lists them,
every test title starts with the identifier it keeps, and `npm run check` prints
what was measured beside what was promised.

**One commit, no releases.** The history on `main` is kept flat: the work
is amended into one commit and pushed with a lease on the last SHA seen.
Semantic-release numbered versions from a history that grows; this one is
rewritten, so every amend left the last version tag on a commit no longer in
it, and the next release failed on a tag that already existed. The release
job, its configuration and the changelog it fed were removed; the site is
published by the Pages workflow on every push, and that is the version that
counts.

**The deploy gate holds only what holds still.** Lighthouse's blocking time is
printed, and above 200 ms it says so, but it does not stop a release: on a
shared runner the same build measured 286 ms and then 26.5 ms ten minutes
apart, and the first reading failed a deploy that had nothing wrong with it. A
gate that cries wolf teaches you to press re-run without reading. What still
gates: LCP, CLS, the Lighthouse scores, and the byte budgets.

**A refactor that must not change the rendering is proved, not asserted.**
`npm run fingerprint -- diff before after` compares every computed property at
nine widths in both themes.
