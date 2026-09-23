// Rendering fingerprint for refactors that must not change what visitors see.
//
//   npm run fingerprint -- capture before   # on the current build
//   ...refactor, npm run build...
//   npm run fingerprint -- capture after
//   npm run fingerprint -- diff before after
//
// A capture records, for every element of the home page, all computed style
// properties and the bounding box, at several widths in both themes with the
// disclosures open, plus the print styles and the hover/focus state of the
// main controls. `diff` lists each property that changed. Captures live under
// reports/fingerprints/ (ignored by git). Unlike the visual baselines this
// covers the whole page and states that screenshots cannot show, and it names
// the rule that changed instead of a pixel region.
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { chromium } from '@playwright/test'
import { browserChannel } from './browser.mjs'

const PORT = 4175
const ORIGIN = `http://127.0.0.1:${PORT}`
const DIR = 'reports/fingerprints'
// Regular widths plus both sides of each breakpoint.
const WIDTHS = [320, 390, 760, 761, 768, 1000, 1001, 1024, 1440]
const HOVER_TARGETS = [
  'nav a',
  '.button.primary',
  '.button.secondary',
  '.text-link',
  'header button',
  '.disclosure summary',
  '.hero-publication',
  '.link'
]

const [command, ...labels] = process.argv.slice(2)
if (command === 'capture' && labels[0]) await capture(labels[0])
else if (command === 'diff' && labels[1]) diff(labels[0], labels[1])
else {
  console.error('Usage: fingerprint capture <label> | diff <label-a> <label-b>')
  process.exit(1)
}

// Serialises every element: tag, classes, box and computed properties.
function snapshotPage() {
  return Array.from(document.querySelectorAll('body *')).map((element) => {
    const style = getComputedStyle(element)
    const properties = {}
    for (const name of style) properties[name] = style.getPropertyValue(name)
    const box = element.getBoundingClientRect()
    return {
      tag: element.tagName,
      cls: typeof element.className === 'string' ? element.className : '',
      rect: [box.x, box.y, box.width, box.height].map(Math.round),
      style: properties
    }
  })
}

async function capture(label) {
  const server = spawn(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      'preview',
      '--host',
      '127.0.0.1',
      '--port',
      String(PORT),
      '--strictPort'
    ],
    { stdio: 'ignore' }
  )
  let browser
  try {
    for (let attempt = 0; ; attempt++) {
      if (server.exitCode !== null || attempt === 60)
        throw new Error(
          'Preview server did not start; run npm run build first.'
        )
      try {
        if ((await fetch(ORIGIN)).ok) break
      } catch {
        /* Starting. */
      }
      await setTimeout(250)
    }
    browser = await chromium.launch({ channel: browserChannel })
    const result = {}
    for (const width of WIDTHS) {
      for (const colorScheme of ['light', 'dark']) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          colorScheme,
          reducedMotion: 'reduce'
        })
        await page.goto(ORIGIN)
        for (const summary of await page.locator('summary').all())
          await summary.click()
        result[`${width}-${colorScheme}`] = await page.evaluate(snapshotPage)
        await page.close()
      }
    }
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce'
    })
    await page.goto(ORIGIN)
    const states = {}
    for (const selector of HOVER_TARGETS) {
      const target = page.locator(selector).first()
      await target.hover()
      states[`${selector}:hover`] = await target.evaluate((element) => {
        const s = getComputedStyle(element)
        return [
          s.color,
          s.backgroundColor,
          s.transform,
          s.borderColor,
          s.boxShadow
        ]
      })
      await target.focus()
      states[`${selector}:focus`] = await target.evaluate((element) => {
        const s = getComputedStyle(element)
        return [s.outline, s.outlineOffset, s.boxShadow]
      })
    }
    result.states = states
    await page.emulateMedia({ media: 'print' })
    result.print = await page.evaluate(snapshotPage)
    mkdirSync(DIR, { recursive: true })
    writeFileSync(join(DIR, `${label}.json`), JSON.stringify(result))
    console.log(`Fingerprint "${label}" written to ${DIR}/${label}.json`)
  } finally {
    if (browser) await browser.close()
    server.kill()
  }
}

function diff(labelA, labelB) {
  const a = JSON.parse(readFileSync(join(DIR, `${labelA}.json`), 'utf8'))
  const b = JSON.parse(readFileSync(join(DIR, `${labelB}.json`), 'utf8'))
  let count = 0
  const report = (line) => {
    count++
    if (count <= 200) console.log(line)
  }
  for (const key of Object.keys(a)) {
    if (key === 'states') {
      for (const state of Object.keys(a.states))
        if (
          JSON.stringify(a.states[state]) !== JSON.stringify(b.states?.[state])
        )
          report(
            `state ${state}: ${JSON.stringify(a.states[state])} => ${JSON.stringify(b.states?.[state])}`
          )
      continue
    }
    const before = a[key]
    const after = b[key] ?? []
    if (before.length !== after.length) {
      report(`${key}: element count ${before.length} => ${after.length}`)
      continue
    }
    before.forEach((element, index) => {
      const other = after[index]
      const where = `${key} <${element.tag.toLowerCase()}${element.cls ? '.' + element.cls.split(' ').join('.') : ''}>`
      if (JSON.stringify(element.rect) !== JSON.stringify(other.rect))
        report(`${where} box ${element.rect} => ${other.rect}`)
      for (const name of Object.keys(element.style))
        if (element.style[name] !== other.style[name])
          report(
            `${where} ${name}: "${element.style[name]}" => "${other.style[name]}"`
          )
    })
  }
  console.log(
    count === 0
      ? `No differences between "${labelA}" and "${labelB}".`
      : `${count} difference(s)${count > 200 ? ' (first 200 shown)' : ''}.`
  )
  process.exitCode = count === 0 ? 0 : 1
}
