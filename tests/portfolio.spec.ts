// The boundaries, and only those.
//
// Each title starts with the identifier of the promise it keeps, as listed in
// REQUIREMENTS.md: read one way it says which test covers a promise, read the
// other, which promise has none yet.
//
// A test earns its place here by protecting a promise the page makes that
// nothing else can catch: it is accessible, it is readable without JavaScript,
// it asks nothing of anyone else, and the two printable documents are intact.
// The matrix that ran this file at five widths in two themes tested the same
// stylesheet ten times; what it actually covered are its two edges, and those
// are the two that stayed.
import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { copy } from '../src/content/copy'
import { documentCopy } from '../src/content/document-copy'
import { profile } from '../src/content/profile'
import { sources } from '../src/content/sources'

// Every page the build renders: the portfolio and the CV.
const pages = ['/', '/cv.html']

const AA = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

// The narrowest phone in light, and the desktop in dark: the two ends of the
// responsive system and of the palette. Anything that breaks between them
// breaks at one of them.
for (const [width, colorScheme] of [
  [320, 'light'],
  [1440, 'dark']
] as const) {
  test(`REQ-A11Y-1 ${width}px, ${colorScheme}: accessible, no overflow, nothing traps the scroll`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ colorScheme })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      colorScheme
    )
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)

    // The number comes from the one place that decides it, so changing how
    // many repositories get a full card is one edit and not two.
    await expect(page.locator('.project-row')).toHaveCount(sources.featured)
    // The projects were once a pane with a scroll of its own, and a reader who
    // reached the last one found the page still behind it. Nothing in the page
    // may do that again.
    expect(
      await page.evaluate(() =>
        Array.from(document.querySelectorAll('main *')).some((node) => {
          const { overflowY } = getComputedStyle(node)
          return (
            (overflowY === 'auto' || overflowY === 'scroll') &&
            node.scrollHeight > node.clientHeight
          )
        })
      )
    ).toBe(false)

    let audit = await new AxeBuilder({ page }).withTags(AA).analyze()
    expect(audit.violations).toEqual([])
    // Again at the bottom, where the lazy pictures and the disclosures are.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    for (const summary of await page.locator('summary').all())
      await summary.click()
    // Target size is not asked again here. The pass above has already
    // measured every control on the page; scrolled to the bottom, whatever
    // happens to sit under the sticky header is only a few pixels visible,
    // and axe counts that as a target too small — a fact about where the
    // page was left, not about the control.
    audit = await new AxeBuilder({ page })
      .withTags(AA)
      .disableRules(['target-size'])
      .analyze()
    expect(audit.violations).toEqual([])
    expect(errors).toEqual([])
  })
}

test('REQ-A11Y-2 keyboard, saved theme and a destination the sticky header does not cover', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Skip to content' })
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
  // The drawing belongs to the theme: greeting the day in the light one, at
  // the desk in the dark one. Only the one in force is fetched, which is why
  // it is a background rather than two elements with one hidden.
  const drawing = () =>
    page
      .locator('.portrait-figure')
      .evaluate((node) => getComputedStyle(node).backgroundImage)
  expect(await drawing()).toContain('david-working')

  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  expect(await drawing()).toContain('david-wave')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page
    .getByRole('link', { name: copy.sections.publication, exact: true })
    .click()
  const header = await page.getByRole('banner').boundingBox()
  expect(header!.height).toBeLessThanOrEqual(64)
  const title = await page.locator('#achievements-title').boundingBox()
  expect(title!.y).toBeGreaterThanOrEqual(header!.height)
  expect(title!.y + title!.height).toBeLessThan(844)

  // The menu marks the section being read, including at the end of the page.
  // An indicator that needs a section to cross the middle of the screen marks
  // nothing once the last one is against the footer, and a menu that marks
  // nothing looks broken.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(150)
  await expect(
    page.locator('nav[aria-label="Main navigation"] a[aria-current="true"]')
  ).toHaveCount(1)
})

test('REQ-NOJS-1, REQ-A11Y-3 readable without JavaScript, and at 200% text', async ({
  browser,
  page
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 }
  })
  const staticPage = await context.newPage()
  for (const route of pages) {
    await staticPage.goto(`http://127.0.0.1:4173${route}`)
    await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
    // Every page has its content in the markup, not only after a script.
    expect(await staticPage.locator('main h2').count()).toBeGreaterThan(0)
    expect(
      await staticPage.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    // With no script to play them, the clips keep the browser's own controls:
    // it is the only way left to see one.
    expect(
      await staticPage.evaluate(() =>
        [...document.querySelectorAll('video')].every((clip) => clip.controls)
      )
    ).toBe(true)
  }
  await context.close()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.addStyleTag({ content: 'html { font-size: 200%; }' })
  // Items inside a horizontal scroller (the mobile menu) reflow by scrolling
  // that strip, not the page.
  const overflow = await page.evaluate(() =>
    Array.from(document.querySelectorAll('body *'))
      .filter((el) => el.getBoundingClientRect().right > innerWidth)
      .filter((el) => {
        for (let box = el.parentElement; box; box = box.parentElement) {
          const { overflowX } = getComputedStyle(box)
          if (
            (overflowX === 'auto' || overflowX === 'scroll') &&
            box.scrollWidth > box.clientWidth &&
            box.getBoundingClientRect().right <= innerWidth
          )
            return false
        }
        return true
      })
      .map((el) => ({ tag: el.tagName, class: el.className }))
  )
  expect(overflow).toEqual([])
})

test('REQ-MOTION-1 the pictures resolve and the clips fetch nothing before they are played', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const route of ['/']) {
    await page.goto(route)
    for (const video of await page.locator('video').all()) {
      await expect(video).toHaveAttribute('preload', 'none')
      await expect(video).toHaveJSProperty('muted', true)
      await expect(video).toHaveAttribute('poster', /\.webp$/)
    }
    for (const img of await page.locator('img').all()) {
      await img.scrollIntoViewIfNeeded()
      await expect
        .poll(() =>
          img.evaluate((node) => (node as HTMLImageElement).naturalWidth)
        )
        .toBeGreaterThan(0)
    }
  }
})

test('REQ-DOC-1 the CV is whole, accessible and printable', async ({
  page
}) => {
  await page.goto('/cv.html')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.name)
  // Matched loosely on purpose: the part after the comma is the screen-reader
  // half of the name, and it is positioned out of the flow, so the browser
  // joins it with whitespace this assertion has no business knowing about.
  await expect(
    page.getByRole('link', {
      name: new RegExp(
        `${documentCopy.actions.download}\\s*, ${documentCopy.hints.pdf}`
      )
    })
  ).toHaveAttribute('href', '/david-cohen-cv.pdf')
  // The CV wears the site's skin, so it answers the same theme the portfolio
  // was left in rather than opening in a light page of its own.
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/)
  expect(
    (await new AxeBuilder({ page }).withTags(AA).analyze()).violations
  ).toEqual([])
  await page.emulateMedia({ media: 'print' })
  // Everything that exists to be pressed, named as it is now. `toBeHidden`
  // also passes for an element that is not there at all, so each of these is
  // checked to exist on the screen first — a rule that hides a selector
  // nothing matches is a rule that guarantees nothing.
  for (const furniture of ['.document-header', '.cv-tools', '.doc-actions']) {
    await page.emulateMedia({ media: 'screen' })
    await expect(page.locator(furniture)).toHaveCount(1)
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator(furniture)).toBeHidden()
  }
  await page.pdf({
    path: 'reports/cv-print.pdf',
    format: 'A4',
    preferCSSPageSize: true
  })
  // A CV that prints to a ream is not a CV. The first printing after the page
  // moved to the site's stylesheet came out at thirteen sheets, because the
  // column that holds the dates on screen was still eating a quarter of the
  // measure on paper — and nothing here would have said so.
  const printed = readFileSync('reports/cv-print.pdf')
  const sheets = printed.toString('latin1').split('/Type /Page').length - 1
  expect(sheets).toBeGreaterThan(0)
  expect(sheets).toBeLessThanOrEqual(10)

  await page.emulateMedia({ media: 'screen' })
  // The page served for an address that does not exist: it belongs to this
  // site, it says it is not to be indexed, and it offers the way back.
  await page.goto('/404.html')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Page not found'
  )
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow'
  )
  await expect(page.getByRole('link', { name: 'Portfolio' })).toHaveAttribute(
    'href',
    '/'
  )
  expect(
    (await new AxeBuilder({ page }).withTags(AA).analyze()).violations
  ).toEqual([])
})

test('REQ-DOC-2 the documents say who they are, and no page carries broken or foreign text', async ({
  page
}) => {
  for (const url of pages) {
    await page.goto(url)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    )
    const schema = JSON.parse(
      await page
        .locator('script[type="application/ld+json"]')
        .first()
        .innerText()
    )
    expect(JSON.stringify(schema)).toContain(profile.name)
    // Mojibake, a former employer that must not appear, a name that is not
    // David's to publish: each of these has happened once.
    expect(await page.locator('body').innerText()).not.toMatch(
      /Consulting World|Michele Monti|�|â€|Â·|Ã—/
    )
  }
})

// The footer says the page makes no third-party request. This is what says it.
test('REQ-PRIV-1 the page loads nothing from anywhere else', async ({
  page
}) => {
  const external: string[] = []
  page.on('request', (request) => {
    const { hostname } = new URL(request.url())
    if (hostname !== '127.0.0.1' && hostname !== 'localhost')
      external.push(request.url())
  })
  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForLoadState('networkidle')
  expect(external).toEqual([])
})

test('REQ-MOTION-1 a clip plays when it is reached, alone, and not at all with motion turned down', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const fetched: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('.mp4'))
      fetched.push(request.url().split('/').pop()!)
  })

  // The project runs with motion off, which is what a visitor who asked for
  // less of it gets: nothing plays, and nothing is downloaded either.
  await page.goto('/')
  await page.evaluate(() =>
    document
      .querySelectorAll('.projects-list video')[1]!
      .scrollIntoView({ block: 'center', behavior: 'instant' })
  )
  await page.waitForTimeout(600)
  expect(fetched).toEqual([])
  expect(
    await page.evaluate(() =>
      [...document.querySelectorAll('video')].every((clip) => clip.paused)
    )
  ).toBe(true)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.evaluate(() =>
    document
      .querySelectorAll('.projects-list video')[1]!
      .scrollIntoView({ block: 'center', behavior: 'instant' })
  )
  // Which clip that leaves most in view is the page's business, not this
  // test's: the order of the cards comes from GitHub and changes when a
  // repository is pinned. What is promised is that the one most in view is
  // the one that plays, that it plays alone, and that nothing else was
  // fetched — so the expectation is read off the page rather than written in.
  const mostVisible = async () =>
    page.evaluate(async () => {
      const clips = [...document.querySelectorAll('video')]
      const ratios = await Promise.all(
        clips.map(
          (clip) =>
            new Promise<number>((resolve) => {
              const observer = new IntersectionObserver(([entry]) => {
                observer.disconnect()
                resolve(entry.intersectionRatio)
              })
              observer.observe(clip)
            })
        )
      )
      // The file is named by a <source>: nothing is loaded yet, so the
      // element's own currentSrc is still empty.
      const files = clips.map((clip) =>
        clip.querySelector('source')!.src.split('/').pop()!
      )
      const best = ratios.indexOf(Math.max(...ratios))
      return {
        file: files[best],
        others: files.filter((_, index) => index !== best)
      }
    })
  const { file, others } = await mostVisible()
  // A clip has to load before it can play, and how long that takes depends on
  // the machine: this waits for the state rather than for a number of
  // milliseconds.
  const playingNow = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('video')]
        .filter((clip) => !clip.paused)
        .map((clip) => clip.currentSrc.split('/').pop())
    )
  await expect.poll(playingNow, { timeout: 5000 }).toEqual([file])
  // One clip plays, the one that was reached, and a clip that was never
  // reached was never asked for.
  expect(fetched).toEqual([file])
  for (const other of others) expect(fetched).not.toContain(other)

  // The clip is its own control: the native bar is off, a click stops it and
  // it stays stopped, and the keyboard does the same thing (WCAG 2.2.2 and
  // 2.1.1). Without JavaScript the bar is still in the markup, which the
  // no-JS test checks.
  expect(
    await page.evaluate(() =>
      [...document.querySelectorAll('video')].every((clip) => !clip.controls)
    )
  ).toBe(true)
  const clip = page.locator(`video:has(source[src$="${file}"])`)
  await clip.click()
  await expect.poll(playingNow, { timeout: 2000 }).toEqual([])
  await page.waitForTimeout(400)
  expect(await playingNow()).toEqual([])
  await clip.press('Enter')
  await expect.poll(playingNow, { timeout: 2000 }).toEqual([file])
})
