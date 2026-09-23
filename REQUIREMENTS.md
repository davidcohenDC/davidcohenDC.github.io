# Requirements

What this page promises, what the promise is worth in numbers, and what measures
it. One line per promise; if a line has no threshold and no measurer, it is a
wish and does not belong here.

`npm run check` ends by writing `reports/requirements.json` and printing this
table with the measured value beside each threshold, so a failure reads as
_"REQ-SIZE-1: 100,400 of 100,000"_ rather than as a red job.

| ID           | Promise                                                                           | Threshold              | Measured by                       |
| ------------ | --------------------------------------------------------------------------------- | ---------------------- | --------------------------------- |
| REQ-A11Y-1   | No WCAG 2.2 AA violation, at both ends of the responsive system and both themes   | 0 violations           | axe, in `tests/portfolio.spec.ts` |
| REQ-A11Y-2   | Reachable and operable from the keyboard, skip link included                      | passes                 | `tests/portfolio.spec.ts`         |
| REQ-A11Y-3   | At 200% text nothing leaves the screen                                            | 0 elements out         | `tests/portfolio.spec.ts`         |
| REQ-A11Y-4   | Lighthouse accessibility                                                          | = 1                    | `scripts/performance.mjs`         |
| REQ-PRIV-1   | The page asks nothing of any third party                                          | 0 requests             | `tests/portfolio.spec.ts`         |
| REQ-NOJS-1   | Both pages read in full without JavaScript                                        | passes                 | `tests/portfolio.spec.ts`         |
| REQ-MOTION-1 | A clip plays only when reached, one at a time, never with motion turned down      | passes                 | `tests/portfolio.spec.ts`         |
| REQ-PERF-1   | Largest contentful paint, simulated mobile                                        | ≤ 2,500 ms             | Lighthouse                        |
| REQ-PERF-2   | Cumulative layout shift                                                           | = 0                    | Lighthouse                        |
| REQ-PERF-3   | Lighthouse performance                                                            | ≥ 0.90                 | Lighthouse                        |
| REQ-SIZE-1   | JavaScript the pages reference, before the site is interactive                    | ≤ 100,000 B gzip       | `scripts/performance.mjs`         |
| REQ-SIZE-2   | JavaScript reached only through a dynamic import                                  | ≤ 60,000 B gzip        | `scripts/performance.mjs`         |
| REQ-SIZE-3   | CSS                                                                               | ≤ 16,000 B gzip        | `scripts/performance.mjs`         |
| REQ-SIZE-4   | The typefaces the page ships (the display cut is preloaded, the reading face not) | ≤ 45,000 B             | `scripts/performance.mjs`         |
| REQ-CO2-1    | What one visit costs                                                              | ≤ 0.05 g CO₂           | Website Carbon, via `performance` |
| REQ-ARCH-1   | Every import obeys the dependency rule between layers                             | 0 violations           | `src/architecture.test.ts`        |
| REQ-DOC-1    | The CV stays whole, accessible and printable                                      | passes; CV ≤ 10 sheets | `tests/portfolio.spec.ts`         |
| REQ-DOC-2    | No page carries broken encoding or a name that is not David's to publish          | 0 matches              | `tests/portfolio.spec.ts`         |

## How a test says which promise it keeps

The identifier is the first thing in the test's title:

```ts
test('REQ-PRIV-1 the page loads nothing from anywhere else', async ({ page }) => {
```

Read one way it says which test covers a promise; read the other, which promise
has no test yet. A test with no identifier is allowed — it is a regression
guard, not a requirement — but a requirement with no test is not.

## Changing a threshold

A threshold is a decision, so it is changed in one place, `REQUIREMENTS.md`
being the readable copy and `scripts/requirements.mjs` the executable one, and
the commit that changes it says why. Lowering a budget is ordinary; raising one
needs the sentence that explains what was bought with the bytes.
