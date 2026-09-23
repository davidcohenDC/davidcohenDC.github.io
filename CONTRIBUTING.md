# Contributing

Three procedures cover almost everything anyone needs to do here. All of them
end the same way: `npm run check`, which is green or the change is not done.

## Add a project

Nothing about a project is written in this repository. Add its full name to
`repositories` in `src/content/sources.ts`, in the order you want it shown, and
run `npm run sync`.

```ts
repositories: [
  'Scala-Robotics-Simulator/PPS-22-srs',
  'davidcohenDC/lecturize',
  'davidcohenDC/your-new-repository'
]
```

The first `featured` repositories with a picture render as full entries and
the rest as one line each. Everything a visitor reads comes from GitHub: the name from the first
heading of the README, the sentence from the repository description, the
category and the tags from the topics, the years from the repository's dates,
and the release, CI state, licence and stars from the API. **To change what the
page says, change it on GitHub** — the README heading, the description, the
topics — and run the sync again.

Two optional bindings, keyed by the same full name:

- a picture or a clip, in `src/media/bindings.ts`;
- the records its module links to besides GitHub (an experiment notebook, a
  paper), in `src/content/project-links.ts`.

A repository with neither still renders: `GeneratedCover` draws one from what
GitHub already says about it — the icon its topics choose, its full name, and a
tint picked from that name so two coverless projects never look alike. Binding a
picture replaces it; nothing has to be written either way.

## Add an achievement

Add the DOI to `papers` in `src/content/sources.ts` and run `npm run sync`.

```ts
papers: [
  {
    doi: '10.1016/j.neunet.2025.108249',
    code: 'https://github.com/disi-unibo-nlp/prism',
    archive: {
      href: 'https://cris.unibo.it/handle/11585/1027360',
      label: 'University of Bologna archive'
    }
  }
]
```

Title, journal, volume, year, authors and citations come from Crossref; the
abstract and the open-access status from OpenAlex. `code` and `archive` are
links to records somebody else keeps, which is the only kind of address written
by hand here. The picture of the first page is bound in `src/media/bindings.ts`
by DOI.

The rule for what belongs on this list: it has a permanent record, and
everything the page says about it comes from that record. A sentence about your
own work is a claim, and claims live in the CV (`src/content/cv.ts`), which is a
document with a name on it.

## Change the drawing in the hero

Two drawings, one per theme: David greeting the day, David at his desk at night.
Replace `assets-source/hero/david-wave-source.png` or
`david-working-source.png`, keep the names, and run:

```sh
pip install pillow scikit-image fonttools
python scripts/portrait.py   # traces them; writes public/hero/*.svg
```

There is no `npm run images` step: the drawings are not pictures any more. The
tracer cuts each one into bands of brightness, turns every band into an outline,
and fills it with a colour read straight out of `styles/theme.css` — so they are
sharp at any size, they weigh about 14 KB for the pair, and they cannot drift
out of step with the palette. Changing a colour there is a re-run of this
script.

They are background images rather than inline SVG (`styles/portrait.css`), for
two reasons: only the drawing the current theme asks for is ever fetched, and a
drawing imported by a component lands in the pre-rendered HTML _and_ in the
bundle React hydrates with — which is 13 KB over the JavaScript budget.

The two are placed on one canvas at the same figure height, so the head does not
jump when the theme changes; the change itself is a 0.45s fade and nothing else,
because a print that bobs when the pointer passes is a sticker.

`TOLERANCE` in the script is how simple they get. Three is the setting here;
past about five the eyes stop being eyes. `DAY_CUTS` and `NIGHT_CUTS` are the
band edges, and the last one is exactly `1.0` on purpose: a pixel brighter than
the last cut belongs to no band and lets the page show through the face.

## Change a colour, a size or a spacing

All of them are in `src/styles/theme.css`, declared once:

- **Colour** — the roles (`--color-ink`, `--color-surface`, `--color-accent`,
  `--color-signal`, …) for the light theme, redeclared under
  `html[data-theme='dark']`. Measure the new value against every ground it can
  land on, including a tag's own fill, which is darker than the page and the
  wash; axe checks the result at both ends on every run.
- **Type** — five sizes, `--text-xs` to `--text-xl`. Everything above them is
  `initial` on purpose: a sixth size is a decision, not an accident. Two faces:
  `--font-sans` (Archivo, for reading) and `--font-mono` (for dates, versions
  and tags, through the `mono` utility). The font file is made by
  `scripts/font.py`, which also prints the fallback metrics in
  `styles/fonts.css` — change one and you have to reprint the other, or the page
  stops having a CLS of zero. The file is trimmed to Latin-1 and the marks the
  page sets, so after a change that introduces a new one, run
  `python scripts/font.py --check`: it reads the built pages and names any
  character they use that the subset would drop.
- **Spacing** — the 4 px step (`--spacing`) and the fluid rhythm (`--gap-*`,
  `--section-gap`, `--heading-gap`).

The CV reads the same tokens: it is built from the site's components and
utilities, so a colour changed here changes it too. Components carry their own
utilities; the shared class lists live next to the component that owns them
(`src/ui/Entry.tsx`, `src/documents/cv/CvEntry.tsx`). A stylesheet is for what a
utility cannot express: pseudo-elements, keyframes, `:hover` gated on
`(hover: hover)`, and print.

## The development environment

```sh
npm ci            # installs, and points git at .githooks
npm start         # the site, with the CV
npm run check:fast # format, lint, types, unit tests, build — about 12s
npm run check     # all of that plus axe, Lighthouse and the budgets — about 90s
```

Run `check:fast` after an edit and `check` before a commit. The four static
checks have no reason to wait for each other, so `checks.mjs` runs them at once
and prints a line each; the browser work is what costs the other eighty seconds,
and most edits do not need it.

Two more, for the questions that otherwise get answered by guessing:

```sh
npm run trace              # what the page downloads, and what LCP measured
npm run trace -- cv.html
npm run shot               # reports/shot-*.png, both themes, phone and desktop
npm run shot -- cv.html dark 412
```

`trace` exists because an afternoon went into blaming a typeface for a Largest
Contentful Paint regression that was really a preload asking for the wrong
variant of an image — 49 KB fetched at high priority and never used, in front of
the element being measured. Two numbers, before and after, cannot show that; the
request chain shows it at a glance, in four seconds. Reach for it before
reaching for a theory, and before pushing to read a number off CI.

`npm ci` runs `prepare`, which sets `core.hooksPath` to `.githooks`. Two hooks,
both cheap:

- **pre-commit** — Prettier's check and the linter, a second together.
- **commit-msg** — commitlint. The convention is checked where a wrong message
  still costs nothing, rather than in CI, where it costs a force-push. CI
  checks it too, on a pull request and on what lands on `main`: the scheduled
  sync commits from a workflow file, where no hook can reach it.

The linter is [oxlint](https://oxc.rs): correctness, suspicious patterns,
accessibility and import hygiene, as errors. Every rule that is off says why in
`.oxlintrc.json` — `react-in-jsx-scope` because of the modern JSX transform,
`no-redundant-roles` because Safari drops `role="list"` when `list-style` is
none, `react-perf` because this page renders once and hydrates. A linter whose
output you learn to ignore is worse than no linter, so a finding here is always
worth acting on.

## Commit messages

Conventional commits, so the type says at a glance what a change is:

```
feat(theme): the sun and the moon break a little on every press
fix(nav): the menu marks the last section when you reach the bottom
refactor(ui): five sizes, one hue fewer
```

Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`,
`chore`. The subject is a sentence without its full stop, lower case, at most 72
characters. The body says what was measured — a commit that changes a budget or
a threshold carries the number that justifies it.

The history on `main` is kept flat: one commit, amended and pushed with
`git push --force-with-lease=main:<the SHA you last saw>` so a snapshot the
scheduled sync pushed in between is never overwritten. There are no
releases or version tags — a version pinned to a commit the next amend
removes would say nothing — and every push to `main` is published by the
Pages workflow.

`feat` and `fix` release; `perf` releases a patch; the rest do not. A breaking
change is a `!` after the type and a `BREAKING CHANGE:` paragraph in the body.

## The rules the tools enforce

- **Layers depend downwards only.** `src/architecture.test.ts` reads every
  import and fails the build when one points the wrong way. The table is in the
  README.
- **No word is written in a component.** Labels live in `src/content/copy.ts`
  and `src/content/document-copy.ts`, long-form text in `src/content/`. A
  convention, reviewed rather than tested.
- **Every requirement has a test that names it.** A test title starts with the
  identifier from `REQUIREMENTS.md`; a regression guard may have none, a
  requirement may not.
- **Formatting is not a discussion.** `npm run format` (Prettier: no semicolons,
  single quotes, no trailing commas), checked in CI.

## When the rendering must not change

Moving CSS between files, renaming a class, upgrading the bundler:

```sh
npm run fingerprint -- capture before
# …the change…
npm run build && npm run fingerprint -- capture after
npm run fingerprint -- diff before after
```

It lists every computed property that changed, at nine widths in both themes,
naming the element. For a refactor that must leave the page as it was, that is
the difference between believing and knowing.

## After a deliberate visual change

Look at it: `npm run shot` writes the page at a phone's width and a desktop's,
in both themes, to `reports/`. There are no pixel baselines to refresh — a
design change is not a regression, and a test that fails on every one of them
teaches nothing but `--update-snapshots`.
