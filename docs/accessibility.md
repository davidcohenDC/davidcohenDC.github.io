# Accessibility and quality verification

Local review; not a claim of WCAG certification.

## Implemented

- Prerendered semantic portfolio and standalone HTML CV; essential content works without JavaScript.
- Named landmarks, one h1, logical headings, descriptive links and native details/summary controls. Links that leave the site end with ↗ and announce “external site”; links inside the site end with →. The wordmark’s accessible name starts with its visible text (WCAG 2.5.3).
- Skip link and focusable section destinations; visible focus, keyboard operation, reduced motion and forced colors.
- On phones the hero is one column and its actions read in order of intent: View CV (primary), the e-mail address (secondary), GitHub (text link); labels wrap at 200% text size instead of overflowing. Content remains visible before any scrolling. Motion only adds an optional small translation. Hover styles apply only on devices that can hover; every control gives press feedback, and the back-to-top button appears only while scrolling up, so it never covers what is being read.
- The header stays sticky at every width. On mobile it is a single 56 px row at standard text size; the five-item menu scrolls sideways when it does not fit, with the next item partly visible as the cue, and links keep a visible focus ring inside the scroll area. Research title precedes the thumbnail in DOM and mobile reading order.
- Main controls have generous targets; mobile navigation targets are at least 44 × 44 px, theme control 44 × 44 px, and paper attribution links at least 32 px tall. No interactive control relies on a 16 px caption line.
- Theme follows the OS until the visitor chooses one; local preference survives reload, and blocked storage does not prevent interaction.
- Shared card tracks keep results and actions aligned; cards become one column below 900 px.
- CV has section navigation, selectable text, a print action, A4 print styling and an original PDF download. Portfolio also has a print stylesheet.
- Icons are decorative SVGs; visible text names actions. Unstyled lists retain `role="list"` for Safari/VoiceOver.
- UTF-8 source policy in .editorconfig and LF policy in .gitattributes; regressions in rendered text are tested.

## Repeatable checks

`npm run check` runs TypeScript, Vitest, a fresh build, Playwright/axe and a local Lighthouse mobile audit. CI uses the same command. Browser tests cover 320, 390, 768, 980 and 1440 px in light/dark, collapsed/expanded content, keyboard navigation, stored/system theme, mobile anchor placement, no-JavaScript HTML, 200% text sizing, CV/portfolio print export and SEO metadata; visual regression baselines guard the six page regions at 390 and 1440 px in both themes. Reports are generated locally under `reports/` and uploaded as CI artifacts when that workflow runs.

Budgets: main JS at most 65,000 bytes gzip, CSS at most 12,000 bytes gzip, static build below 1.5 MB plus at most 2 MB of clips under `media/`, which load only on play. Lighthouse mobile: performance at least 90, LCP at most 2.5 seconds, CLS at most 0.1 and TBT at most 200 ms. These are lab checks, not observed field Core Web Vitals. INP and field percentile data require a published site and actual visits; no tracking service has been added.

The static pages include canonical metadata, ProfilePage/Person JSON-LD (job title, university, interests, contact and profiles) linked to a ScholarlyArticle node for the publication with all six authors, and a JPEG Open Graph image. Preview builds intentionally remain noindex. The root deployment target is configured explicitly; production generation is separate from publication.

## Limits and follow-up

Automated audits and browser semantics do not replace a spoken NVDA/VoiceOver session or testing with people who use assistive technology. This environment has not performed that spoken-output testing. The supplied original PDF and external publisher site have not been certified for accessibility. HTML is the primary accessible CV format. Browser-generated print PDFs are QA artifacts, not a claim of PDF/UA conformance.

The three clips (SRS, ARGoS and S-Parking cards) are muted, have no speech or on-screen text that matters, never autoplay and carry an `aria-label` plus a caption describing what happens on screen; nothing downloads before play. On the cards the clip is its own control: it is focusable, a click or Enter stops it, and scrolling past it stops it (WCAG 2.2.2, 2.1.1); without JavaScript the native bar stays, since nothing plays by itself there. With reduced motion or on a metered connection nothing plays by itself either, and the clip shows a play mark instead of the bar: it is focusable, a click or Enter plays it once, and the same stops it. On phones the header menu scrolls horizontally and its right edge is faded with a mask, so a cut item reads as “there is more” rather than as a truncated word. Live field performance and the LinkedIn preview must be checked after an approved publication.

## Paper preview provenance

Source: https://cris.unibo.it/handle/11585/1027360
PDF retrieved: https://cris.unibo.it/retrieve/2cc92a42-3d51-47a3-a65b-a6700a1c6422/1-s2.0-S089360802501130X-main.pdf
DOI: https://doi.org/10.1016/j.neunet.2025.108249
Authors: Giacomo Frisoni, Luca Ragazzi, David Cohen, Gianluca Moro, Antonella Carbonaro, Claudio Sartori.
Copyright: © 2025 The Authors. CC BY 4.0, as printed on page 1.
Asset: assets-source/research/prism-first-page.webp (840 × 1119), served as 280/560/840 px variants from public/research/.
Processing: page 1 rendered with Poppler and encoded as WebP, then resized by `npm run images`; no content replacement, recoloring or synthetic reconstruction.
The preview does not replace the article. It links to the publisher, with visible attribution and an institutional-source link.

## References

- [WAI page structure](https://www.w3.org/WAI/tutorials/page-structure/)
- [WAI reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Manual accessibility testing](https://web.dev/learn/accessibility/test-manual)
- [Core Web Vitals](https://web.dev/articles/vitals)
- [Google ProfilePage metadata](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [LinkedIn sharing requirements](https://www.linkedin.com/help/linkedin/answer/a521928/making-your-website-shareable-on-linkedin?lang=en)
- [React CRA deprecation](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)

## Latest completed local run — 17 September 2026

- `npm run check`: PASS, including four Vitest tests and thirteen Playwright tests.
- axe: zero reported WCAG A/AA violations in the covered states; automated results do not imply complete conformance.
- Lighthouse simulated mobile: 99 performance, 100 accessibility, LCP 1.84 s, CLS 0, TBT 0 ms.
- Main bundle: 55,079 bytes gzip; CSS: 5,443 bytes gzip. Entire static output: 651,536 bytes; no unused PNG originals.
- CV print: all three A4 pages rendered and visually inspected; Unicode and content extraction checked. The print button is exercised in the browser tests.
- Manual browser check: mobile header 65 px; Research title lands about 231 px from the viewport top, before the paper image.
- Development `/cv.html` and production metadata/crawl generation checked. Local preview restored to noindex.
- npm dependency audit: zero vulnerabilities reported at the time of this run.

Reports are regenerated by the commands above; these figures are a dated local observation, not a hosted or real-user measurement.

## Latest completed local run — 18 September 2026

- `npm run check`: PASS; five Vitest tests and sixteen Playwright tests, after the final source changes.
- axe: zero reported violations in all tested light/dark and expanded/collapsed homepage states, plus CV and SRS pages. Widths: 320, 390, 768, 980, 1440 CSS px. Chromium only; no claim of cross-browser certification.
- Lighthouse mobile: 99 performance, 100 accessibility, LCP 1.88 s, CLS 0, TBT 0 ms. Main JS: 55,464 bytes gzip; CSS: 5,178 bytes gzip; static output: 761,905 bytes.
- Genuine SRS screenshot and generated chart load; chart values, sample sizes, step limits and caveats are present in accessible HTML.
- All three reading routes work without JavaScript. Homepage also passes 200% text reflow. Facts about the paper are above the fold at 390 × 844.
- CV print: four A4 pages, all visually inspected; original current ATS PDF: two pages, both inspected; SRS print: two pages, both inspected. No clipping found.
- The downloadable PDF matches the current 18 September `resume_ats.pdf` byte for byte (SHA-256 recorded in the local static audit).
- Internal file/fragment links checked: zero missing destinations. Fifteen public external URLs reachable (LinkedIn requires GET instead of HEAD); reachability does not certify their content or accessibility.
- Production metadata, canonical URLs, robots and the three-route sitemap checked; local preview restored to noindex. No publication, commit or push.
- npm audit: zero known vulnerabilities returned on this date.

## Latest completed local run — 18 September 2026, after the front-end refactor

- `npm run check`: PASS with the machine's Chrome (no browser download); five Vitest tests, sixteen Playwright behaviour tests and four visual-regression tests (24 Windows baselines).
- axe: zero reported violations at 320, 390, 768, 980 and 1440 px in light/dark, collapsed and expanded, plus CV and SRS pages. Chromium/Chrome only.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, LCP 1.58 s, CLS 0, TBT 0 ms; about 175 KiB transferred on the mobile home page thanks to responsive images. Main JS: 56,166 bytes gzip; CSS: 5,323 bytes gzip; static output: 993,364 bytes including all image variants.
- Contrast: every text/background pair measured at 4.9:1 or better in light mode and 7:1 or better in dark mode, including the research band in both themes; no text below 13 px.
- Sticky header at every width (57 px on phones); after choosing a menu item the section heading lands below the bar (124–136 px from the top at 390 px).
- Print: portfolio 8 A4 pages, CV 4, SRS case study 2, all with the ink-on-white palette from any theme.
- npm audit: zero known vulnerabilities on this date.

For the audit findings and the refactor they led to, see `docs/audit-2026-09-18.md`; `docs/content.md` and `docs/image-assets.md` describe how to add material. The human assistive-technology session, hosted validation and field performance remain outstanding.
