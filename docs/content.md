# Adding content

How to add or change text, images, video and GIFs without touching the layout. Everything visible on the two pages comes from the APIs listed in `src/content/sources.ts` or from `src/content/`; components and CSS should not need edits for a content change.

## Where things live

| Content | File | Notes |
| --- | --- | --- |
| Which repositories and papers appear, and how many projects are featured | `src/content/sources.ts` | The only list to edit. Everything shown about them comes from their APIs. |
| Name, e-mail, profiles, description, job title, education, “Updated” date | `src/content/profile.ts` | Feeds the hero, the footer, the CV header and the JSON-LD `Person`. Bump `lastUpdated` with every content change. |
| Which picture or clip illustrates which repository or paper | `src/media/bindings.ts` | Files only, keyed by repository full name or DOI. |
| The interface's own words: section names, links, landmarks, screen-reader labels | `src/content/copy.ts` (the portfolio), `src/content/document-copy.ts` (CV, 404) | No component writes a word of its own. |
| CV-only claims: contribution, decisions, paper credit | `src/content/cv.ts` | Keyed by repository full name or DOI. The portfolio page prints none of it. |
| Links a project's module shows besides GitHub (the SRS experiment notebook) | `src/content/project-links.ts` | A label and an address per record, keyed by repository full name. |
| A project's headline figure and what it counts | `src/content/metrics.ts` | `label` for the CV, `short` for the card. The only words on a card that are not from a record. |
| Experience, skills, languages | `src/content/experience.ts`, `src/content/cv.ts` | CV only. |
| Images | `assets-source/` + `src/media/images.ts` | See `docs/image-assets.md`. |

Claims stay within what the evidence supports: what a project or a paper is comes from its record; what David claims comes from the documents he signs.

## Adding a project

1. Add its full name (`owner/repo`) to `repositories` in `src/content/sources.ts` and run `npm run sync`. That alone puts it on the page: a line under “Also on GitHub”, or a card if it has a picture (step 3) and is among the first `featured` of those.
2. To move it up, pin it on GitHub (the workflow has a token) or move it up the list.
3. To give it a picture or a clip, add the original to `assets-source/projects/`, an entry to `src/media/images.ts`, run `npm run images`, and bind it in `repositoryMedia` in `src/media/bindings.ts`. Without one, the card shows a generic cover with the repository's name.
4. For the CV, add its contribution, figure and decisions to `projectClaims` in `src/content/cv.ts`.

Its icon comes from its topics (`src/sections/projects/topic-icon.ts`), and a PyPI package with the repository's name that links back to it is found by the sync automatically.

## Adding a publication

Add `{ doi, code? }` to `papers` in `src/content/sources.ts` and run `npm run sync`. The title, journal, authors, abstract, citations and licence come from Crossref and OpenAlex. The achievement entry, the hero's publication line, the CV citation and the `ScholarlyArticle` JSON-LD all follow. Bind a first-page image in `paperMedia` (`src/media/bindings.ts`), and put the CV's credit line in `paperClaims` (`src/content/cv.ts`).

## Photos and screenshots

Follow `docs/image-assets.md`. In short: original in `assets-source/`, manifest entry, `npm run images`, commit the WebP variants. For a screenshot that includes window chrome, crop it in the manifest rather than editing the original, so the crop is reproducible.

## Video

Prefer a short (20–60 s) MP4 (H.264, AAC or muted) with a poster image; add a WebM source if you can encode it. Put files under `public/media/` and bind them to a repository in `src/media/bindings.ts` (`clip`); written by hand, a figure looks like this:

```html
<figure>
  <video
    controls
    preload="metadata"
    poster="/media/srs-run-poster.webp"
    width="1280"
    height="720"
  >
    <source src="/media/srs-run.webm" type="video/webm" />
    <source src="/media/srs-run.mp4" type="video/mp4" />
    <track
      kind="captions"
      src="/media/srs-run.en.vtt"
      srclang="en"
      label="English"
    />
  </video>
  <figcaption>
    What the viewer sees, which policy runs, and the outcome.
  </figcaption>
</figure>
```

Rules that keep the page honest and accessible:

- No autoplay, no looping background video; the user presses play (`controls`), so `prefers-reduced-motion` is respected by default.
- `preload="metadata"` so the file does not download until requested; the poster is a manifest image.
- Captions (`.vtt`) or a text transcript next to the video for anything with speech or on-screen text that matters.
- State what the clip documents in the caption (project version, policy, seed).
- Budget: `scripts/performance.mjs` allows 2 MB for everything under `public/media/`, counted separately from the 1.5 MB of static output because the clips load only on play. The two current clips use about 750 KB; anything longer than a minute should be hosted elsewhere (a GitHub release asset, a CDN) with only the poster in the build.

The SRS, ARGoS and S-Parking cards are the examples in the code (`clip` on a project). The encodings used are in `docs/image-assets.md`. A clip of a simulation is worth more than a screenshot of it: both simulators can be recorded headless from their own repositories, which is how these were made.

## GIFs

Use a video instead: a `<video muted playsinline controls>` MP4 is a fraction of the size of a GIF, keeps colour fidelity and gives users pause/scrub. If a GIF is unavoidable, it cannot go through the image manifest (sharp would keep a single frame): place it in `public/media/`, keep it under about 1 MB, add `alt` text describing the sequence, and either keep it under five seconds or provide a way to pause it (WCAG 2.2.2).

## Text

- Copy lives in `src/content/`; sentence case, one idea per sentence, British spelling as in the existing text.
- Running text is capped at 65 characters per line by CSS; long paragraphs wrap naturally, but keep paragraphs to 2–3 sentences.

## After any change

```sh
npm run images        # only if originals or the manifest changed
npm run check         # format, lint, typecheck, unit tests, build, Playwright/axe, Lighthouse, budgets
```

If you refactor CSS or components and nothing should look different, take a fingerprint before and after (`npm run fingerprint -- capture before|after`, then `diff`; see `CONTRIBUTING.md`). To see a change that is meant to alter the page, `npm run shot`.

Then bump `lastUpdated` in `src/content/profile.ts` and commit the data and the generated images together.

## Where the live figures come from

`npm run sync` reads four public sources and writes `src/data/snapshot.json`;
a scheduled Action runs it every half hour and commits the snapshot when it
moves. The page reads the snapshot, never the sources, which is how it can
promise to make no third-party request while still being up to date.

| Source        | What it gives                                                                              | Where it shows                                      |
| ------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| GitHub REST   | description, topics, languages, latest release, last commit, conclusion of the last CI run | the project entries                                 |
| Crossref      | the paper's record and how often it has been cited                                         | the achievement, the hero line, the CV, the JSON-LD |
| OpenAlex      | the abstract, open-access status and licence                                               | the achievement entry                               |
| PyPI          | the published version of a package that links back to its repository                       | the project entry for a package                     |
| pypistats.org | installs in the last month                                                                 | the same line, when that service answers            |

Two rules hold this together. **No source may fail the build**: a call that
does not answer leaves the previous value in place and says so on stderr, so a
page showing a figure from an hour ago is preferred to a page showing nothing
because somebody else was down. And **a fetched figure is credited to whoever
counted it** — the page says "Cited 2 times · Crossref", not "cited 2 times",
because a number the page cannot check is not the page's to claim.

Adding a source means a new adapter in `scripts/sync/adapters/` against the
ports in `scripts/sync/ports.ts`, wired in `scripts/sync/index.ts`: the sync is
the only code that knows the outside world exists.

## The rule: everything outside the hero and the footer is extracted

Only two parts of the page are written by hand: the first screen and the line of contacts in the footer.
Everything in Projects and Publication comes from the repository or from the
paper's record, and the sync is the only thing that reads them — with one
exception, each project's figure, which is David's own claim from
`src/content/metrics.ts`, signed in the CV as well.

| What the page shows                               | Where it comes from                                           |
| ------------------------------------------------- | ------------------------------------------------------------- |
| A project's name                                  | the first heading of its README, on raw.githubusercontent.com |
| What kind of project it is                        | its first two GitHub topics, or its languages                 |
| Its sentence                                      | the repository description                                    |
| Its tags                                          | the rest of its topics                                        |
| Its years                                         | the repository's created and pushed dates                     |
| Its release, CI, package, last commit             | the GitHub API                                                |
| The paper's title, journal, volume, year, authors | Crossref                                                      |
| The paper's summary and open-access status        | OpenAlex (the abstract, first two sentences)                  |
| How often it has been cited                       | Crossref                                                      |

So **to change what the page says, change it at the source**: rename the
README's heading, edit the repository description, reorder the topics. The
local files keep only what an API has no field for — which picture or clip
belongs to which record, which other records a project links to — and the
figures the CV prints, which are David's own assertions in his own document.

A consequence worth knowing: a project's category is its topics, so a
repository whose topics say `deep-learning, machine-learning` is filed under
those words even if a person would have said "robotics". The fix is on GitHub,
where it also helps anyone who finds the repository without the portfolio.
