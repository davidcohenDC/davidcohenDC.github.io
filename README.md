# davidcohendc.github.io

David Cohen's portfolio: two pages — the site and a CV —
pre-rendered to static HTML, hydrated by React, and served from GitHub Pages.

Live at <https://davidcohendc.github.io>.

Two ideas hold the whole thing together:

- **Nothing about a project is written here.** Names, descriptions, categories,
  tags, years, releases, CI state, licences and stars are read from GitHub,
  Crossref, OpenAlex and PyPI at build time and frozen into
  `src/data/snapshot.json`. The page therefore cannot claim something the record
  does not say, and it asks nothing of any third party at runtime.
- **Every promise is a number with a test behind it.** Weight, contrast, layout
  shift, paint, carbon and the dependency rule are in `REQUIREMENTS.md`, and
  `npm run check` prints each threshold beside what was measured.

## Getting started

```sh
npm ci             # installs, and points git at .githooks
npm start          # the site and the CV, on 127.0.0.1:5173
npm run check:fast # format, lint, types, unit tests, build — about 12s
npm run check      # all of that plus axe, Lighthouse and the budgets — about 90s
```

`npm run sync` refreshes the snapshot from the APIs; it is the only step that
touches the network, and it is not part of a build.

`CONTRIBUTING.md` has the four procedures that cover almost everything: adding a
project, adding a publication, changing the drawing in the hero, and changing a
colour, a size or a spacing.

## Architecture

The source is cut into layers, and a layer may import only the layers below it.
`src/architecture.test.ts` reads every import and fails the build when one
points the wrong way, so the table below is enforced rather than aspirational.

| Layer           | What lives there                                         | May import                                           |
| --------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| `src/media`     | the pictures and clips, and what binds them to a subject | —                                                    |
| `src/domain`    | what a project and an achievement are, as types          | `media`                                              |
| `src/content`   | the lists of sources, and the documents David signs      | `domain`, `media`                                    |
| `src/data`      | the snapshot, read and shaped for the page               | `domain`, `content`, `media`                         |
| `src/ui`        | pieces with no opinion about the page they are on        | —                                                    |
| `src/motion`    | one `requestAnimationFrame` loop and its hooks           | —                                                    |
| `src/theme`     | light, dark, and the system's preference                 | `motion`                                             |
| `src/layout`    | header, footer, and the furniture around a page          | `ui`, `data`, `content`, `motion`                    |
| `src/sections`  | the sections of the portfolio, and their registry        | `ui`, `data`, `content`, `domain`, `media`, `motion` |
| `src/documents` | the CV, and its one script                               | `ui`, `data`, `content`, `domain`, `media`, `layout`, `theme`, `motion` |
| `src/app`       | what puts a page together                                | `layout`, `sections`, `motion`, `theme`, `styles`    |

`scripts/sync` is held to the same rule: it may see the snapshot contract and
the list of sources, and nothing else.

Around them: `src/styles` (one theme file with every colour, size and spacing,
and a stylesheet per thing a utility cannot express) and `scripts` (the sync,
the build, the checks, and the small tools — `trace`, `shot`, `fingerprint` —
that answer a question with a measurement instead of a theory).

## Documentation

| File                    | What it answers                                                |
| ----------------------- | -------------------------------------------------------------- |
| `CONTRIBUTING.md`       | how to change something, and what to run afterwards            |
| `REQUIREMENTS.md`       | what the page promises, in numbers, and what measures each one |
| `docs/content.md`       | where every word and picture comes from, and how to add one    |
| `docs/accessibility.md` | what was tested, how, and what is left                         |
| `docs/decisions.md`     | the decisions that cost something, each with its measurement   |
| `docs/image-assets.md`  | provenance and licence of every picture, and the pipeline      |

## Licence

MIT for the code (`LICENSE`). The text, the CV and the drawings of David are
his, and are not covered by it.
