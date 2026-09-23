import { spawn } from 'node:child_process'
import {
  readdirSync,
  readFileSync,
  statSync,
  mkdirSync,
  writeFileSync
} from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { setTimeout } from 'node:timers/promises'
import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'
import { browserChannel } from './browser.mjs'
import { createServer } from 'node:net'

mkdirSync('reports', { recursive: true })

const CARBON = 'src/data/carbon.json'

// Where blocking time stops being ordinary and starts being worth a look. It
// is a watch line, not a budget: see the note beside the check.
const TBT_WATCH = 200

async function footprint(transferred) {
  const before = (() => {
    try {
      return JSON.parse(readFileSync(CARBON, 'utf8'))
    } catch {
      return null
    }
  })()
  try {
    const response = await fetch(
      `https://api.websitecarbon.com/data?bytes=${Math.round(transferred)}&green=0`,
      {
        headers: {
          'User-Agent':
            'david-cohen-portfolio (+https://github.com/davidcohenDC)'
        }
      }
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const { gco2e, rating } = await response.json()
    const next = {
      bytes: Math.round(transferred),
      grams: Number(gco2e.toFixed(3)),
      rating,
      source: 'Website Carbon',
      measured: new Date().toISOString().slice(0, 10)
    }
    if (JSON.stringify(next) !== JSON.stringify(before))
      writeFileSync(
        CARBON,
        `${JSON.stringify(next, null, 2)}
`
      )
  } catch (error) {
    console.warn(
      `Website Carbon did not answer (${error.message}); keeping ${
        before ? `the figure from ${before.measured}` : 'no figure'
      }.`
    )
  }
}
const assets = readdirSync('build/assets').map((name) =>
  join('build/assets', name)
)
const gzipped = (names) =>
  names.reduce((sum, name) => sum + gzipSync(readFileSync(name)).length, 0)
// Scripts and modulepreloads written into the pages are what the browser fetches
// before the site is interactive. A chunk reached through a dynamic import is not
// referenced there: Vite requests it at runtime, when the visitor is already
// reading. The two answer different questions, so they are counted separately
// and the critical budget stays the one that describes the first screen.
const referenced = new Set(
  readdirSync('build')
    .filter((name) => name.endsWith('.html'))
    .flatMap((name) =>
      [
        ...readFileSync(join('build', name), 'utf8').matchAll(
          /assets\/[\w.-]+/g
        )
      ].map((match) => join('build', match[0]))
    )
)
const scripts = assets.filter((name) => name.endsWith('.js'))
const budget = {
  criticalJavascriptGzip: gzipped(scripts.filter((n) => referenced.has(n))),
  deferredJavascriptGzip: gzipped(scripts.filter((n) => !referenced.has(n))),
  cssGzip: gzipped(assets.filter((name) => name.endsWith('.css')))
}
// Raised from 65 KB to 100 KB to make room for motion and richer graphics —
// up to a full animation library — which the 2 KB left under the old ceiling
// could not hold. What a reader waits for is still gated where it is felt:
// LCP, CLS and the Lighthouse score (REQ-PERF-1…3).
if (budget.criticalJavascriptGzip > 100000)
  throw new Error(
    `Critical JavaScript exceeds 100 KB: ${budget.criticalJavascriptGzip} B`
  )
// A deferred chunk must never be on the path to reading: if it fails to load the
// section still renders its static state, exactly as it does without JavaScript.
if (budget.deferredJavascriptGzip > 60000)
  throw new Error(
    `Deferred JavaScript exceeds 60 KB: ${budget.deferredJavascriptGzip} B`
  )
// Raised from 12 KB to 16 KB with the JavaScript budget, and for the same
// reason: the theme dial, the reveal and the interactions left 0.6 KB under
// the old ceiling, which is no room for any further graphic work.
if (budget.cssGzip > 16000)
  throw new Error(`CSS exceeds 16 KB: ${budget.cssGzip} B`)
function bytes(dir) {
  return readdirSync(dir).reduce((sum, name) => {
    const file = join(dir, name)
    return (
      sum + (statSync(file).isDirectory() ? bytes(file) : statSync(file).size)
    )
  }, 0)
}
// The reading face. woff2 is already compressed, so this is what goes over
// the wire, and it is on the critical path: the page preloads it. One file,
// one width, every weight — a second face, or the width axis back, would show
// up here immediately.
// The licence sits in the same folder and is never downloaded, so it is not
// part of what the page costs.
budget.fontBytes = readdirSync('build/fonts')
  .filter((name) => name.endsWith('.woff2'))
  .reduce((sum, name) => sum + statSync(join('build/fonts', name)).size, 0)
if (budget.fontBytes > 45000)
  throw new Error(
    `Fonts exceed 45 KB (${budget.fontBytes}): pin an axis or drop a face.`
  )

// Clips under build/media load only on demand (preload="none"), so they have
// their own budget instead of counting against the page's.
budget.media = bytes('build/media')
budget.totalBuild = bytes('build') - budget.media
if (budget.totalBuild > 1500000)
  throw new Error('Build exceeds 1.5 MB: check unreferenced source images.')
if (budget.media > 2000000)
  throw new Error('Clips exceed 2 MB: re-encode or host them elsewhere.')
const server = spawn(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    '4174',
    '--strictPort'
  ],
  { stdio: 'ignore' }
)
let chrome
try {
  let ready = false
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null)
      throw new Error('Performance preview failed to start.')
    try {
      if ((await fetch('http://127.0.0.1:4174')).ok) {
        ready = true
        break
      }
    } catch {
      /* Starting. */
    }
    await setTimeout(250)
  }
  if (!ready) throw new Error('Performance preview did not start.')
  const socket = createServer()
  await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve))
  const port = socket.address().port
  await new Promise((resolve) => socket.close(resolve))
  chrome = await chromium.launch({
    channel: browserChannel,
    args: [`--remote-debugging-port=${port}`]
  })
  const result = await lighthouse('http://127.0.0.1:4174', {
    port,
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  })
  if (!result || result.lhr.runtimeError)
    throw new Error(JSON.stringify(result?.lhr.runtimeError))
  writeFileSync('reports/lighthouse.html', result.report[0])
  writeFileSync('reports/lighthouse.json', result.report[1])
  const { lhr } = result
  // What one visit weighs on the wire, and what that costs the world.
  //
  // The figure is asked for here rather than in the sync because it depends on
  // the build and not on the time of day: the page's footprint changes when
  // the page changes. Website Carbon does the arithmetic — the Sustainable Web
  // Design model, their coefficients — and the page credits them for it. If
  // they do not answer, the previous number stands, dated as it was.
  const transferred = lhr.audits['total-byte-weight'].numericValue
  await footprint(transferred)

  const summary = {
    budget,
    performance: lhr.categories.performance.score,
    accessibility: lhr.categories.accessibility.score,
    LCP: lhr.audits['largest-contentful-paint'].numericValue,
    CLS: lhr.audits['cumulative-layout-shift'].numericValue,
    TBT: lhr.audits['total-blocking-time'].numericValue,
    note: 'Local simulated mobile lab run. Not field Core Web Vitals; INP needs real interactions and users.'
  }
  writeFileSync(
    'reports/performance-summary.json',
    JSON.stringify(summary, null, 2)
  )
  console.log(JSON.stringify(summary, null, 2))

  // Blocking time is reported, not enforced. On a shared CI runner it is the
  // volatile one: the same build measured 286 ms and then 26.5 ms ten minutes
  // apart, which failed a deploy that had nothing wrong with it. A gate that
  // cries wolf teaches you to press re-run without reading, and that is how a
  // real regression gets through. So it is printed where a reader will see it
  // — and the gate is kept on what holds still between runs.
  if (summary.TBT > TBT_WATCH)
    console.warn(
      `Blocking time ${Math.round(summary.TBT)} ms, above the ${TBT_WATCH} ms ` +
        'watch line. One reading on a shared machine is not a measurement: ' +
        'run it again, and if it stays high, inspect reports/lighthouse.html.'
    )

  if (summary.performance < 0.9 || summary.LCP > 2500 || summary.CLS > 0.1)
    throw new Error(
      'Mobile lab performance budget exceeded; inspect reports/lighthouse.html.'
    )
} finally {
  if (chrome) await chrome.close()
  server.kill()
}
