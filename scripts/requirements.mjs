// The scoreboard: every promise in REQUIREMENTS.md, its threshold, and what
// was actually measured.
//
// It measures almost nothing itself. Lighthouse, the budget check, Playwright
// and Vitest have already run and left their numbers behind; this reads them
// and puts them next to the thresholds, so a failure says which promise broke
// and by how much instead of only turning a job red.
import { readFileSync, writeFileSync } from 'node:fs'

const read = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

const performance = read('reports/performance-summary.json')
const carbon = read('src/data/carbon.json')

// Thresholds live here in their executable form; REQUIREMENTS.md is the
// readable copy of the same numbers.
const checks = [
  [
    'REQ-A11Y-4',
    'Lighthouse accessibility',
    performance?.accessibility,
    1,
    'atLeast'
  ],
  [
    'REQ-PERF-1',
    'LCP, simulated mobile (ms)',
    performance && Math.round(performance.LCP),
    2500,
    'atMost'
  ],
  ['REQ-PERF-2', 'Cumulative layout shift', performance?.CLS, 0, 'atMost'],
  [
    'REQ-PERF-3',
    'Lighthouse performance',
    performance?.performance,
    0.9,
    'atLeast'
  ],
  [
    'REQ-SIZE-1',
    'Critical JavaScript (B gzip)',
    performance?.budget.criticalJavascriptGzip,
    100000,
    'atMost'
  ],
  [
    'REQ-SIZE-2',
    'Deferred JavaScript (B gzip)',
    performance?.budget.deferredJavascriptGzip,
    60000,
    'atMost'
  ],
  ['REQ-SIZE-3', 'CSS (B gzip)', performance?.budget.cssGzip, 16000, 'atMost'],
  [
    'REQ-SIZE-4',
    'The typeface the page preloads (B)',
    performance?.budget.fontBytes,
    45000,
    'atMost'
  ],
  ['REQ-CO2-1', 'One visit (g CO2)', carbon?.grams, 0.05, 'atMost']
]

const results = checks.map(([id, what, measured, threshold, rule]) => ({
  id,
  what,
  measured: measured ?? null,
  threshold,
  rule,
  // A missing measurement is a failure: a promise nobody checked is not kept.
  passed:
    measured === null || measured === undefined
      ? false
      : rule === 'atMost'
        ? measured <= threshold
        : measured >= threshold
}))

writeFileSync(
  'reports/requirements.json',
  `${JSON.stringify({ measured: new Date().toISOString().slice(0, 10), results }, null, 2)}\n`
)

const column = (text, width) => String(text).padEnd(width)
console.log('\nRequirements')
for (const result of results)
  console.log(
    `  ${result.passed ? 'PASS' : 'FAIL'}  ${column(result.id, 12)}` +
      `${column(result.what, 48)}${column(result.measured ?? '—', 10)}` +
      `${result.rule === 'atMost' ? '≤' : '≥'} ${result.threshold}`
  )

const failed = results.filter((result) => !result.passed)
console.log(
  `\n  ${results.length - failed.length}/${results.length} kept` +
    (failed.length ? `; ${failed.map((one) => one.id).join(', ')} not.` : '.')
)
if (failed.length) process.exitCode = 1
