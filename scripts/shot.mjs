// A look at the built page, without writing a throwaway test for it.
//
//     npm run shot                          home, both themes, phone and desktop
//     npm run shot -- /cv.html              one page
//     npm run shot -- /cv.html dark 412     one page, one theme, one width
//
// Writes reports/shot-*.png. Reduced motion is on, so what lands on disk is
// the page at rest rather than halfway through an animation — the same
// contract the visual baselines use.
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { browserChannel } from './browser.mjs'
import { pagePath, withPreview } from './serve.mjs'

const args = process.argv.slice(2)
const path = pagePath(args)
const themes = args.some((a) => a === 'light' || a === 'dark')
  ? args.filter((a) => a === 'light' || a === 'dark')
  : ['light', 'dark']
const widths = args.some((a) => /^\d+$/.test(a))
  ? args.filter((a) => /^\d+$/.test(a)).map(Number)
  : [412, 1280]

mkdirSync('reports', { recursive: true })

await withPreview(async (origin) => {
  const browser = await chromium.launch({ channel: browserChannel })
  const name = path.replace(/[^a-z0-9]+/gi, '') || 'home'
  for (const theme of themes)
    for (const width of widths) {
      const page = await browser.newPage({
        viewport: { width, height: width < 700 ? 900 : 1400 },
        colorScheme: theme,
        reducedMotion: 'reduce'
      })
      await page.goto(origin + path, { waitUntil: 'networkidle' })
      const file = `reports/shot-${name}-${theme}-${width}.png`
      await page.screenshot({ path: file, fullPage: true })
      console.log(file)
      await page.close()
    }
  await browser.close()
})
