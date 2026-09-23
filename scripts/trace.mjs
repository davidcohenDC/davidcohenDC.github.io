// What the page actually downloads, in what order, at what priority — and
// which element Largest Contentful Paint ends up measuring.
//
//     npm run trace                 the home page
//     npm run trace -- /cv.html     any other
//
// This exists because an afternoon went into blaming a typeface for an LCP
// regression that turned out to be a preload asking for the wrong variant of
// an image: 49 KB fetched at high priority and never used, in front of the
// element being measured. Two numbers — before and after — could not have
// shown that. The request chain showed it at a glance, and takes three
// seconds. Reach for this before reaching for a theory.
//
// It reports what the build does, not what the network will do to a visitor:
// no throttling, no CPU slowdown. For the budget, `npm run check:performance`
// is still the measurement that counts.
import { chromium } from '@playwright/test'
import { browserChannel } from './browser.mjs'
import { pagePath, withPreview } from './serve.mjs'

const path = pagePath(process.argv.slice(2))
const width = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 412)

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`.padStart(9)

await withPreview(async (origin) => {
  const browser = await chromium.launch({ channel: browserChannel })
  const page = await browser.newPage({ viewport: { width, height: 900 } })

  const requests = []
  page.on('response', async (response) => {
    const url = response.url()
    if (url.startsWith('data:')) return
    let size = Number(response.headers()['content-length'] ?? 0)
    if (!size)
      size = await response
        .body()
        .then((b) => b.length)
        .catch(() => 0)
    // `startTime` is a wall clock in milliseconds and `responseStart` is
    // relative to it, so a timeline needs the first request as the zero.
    // Printing `responseStart` on its own says how long each request took
    // and nothing at all about when it happened.
    const timing = response.request().timing()
    requests.push({
      url: url.slice(origin.length) || '/',
      size,
      type: response.request().resourceType(),
      sentAt: timing.startTime,
      doneAt: timing.startTime + timing.responseEnd
    })
  })

  await page.goto(origin + path, { waitUntil: 'networkidle' })

  // The element LCP settled on, named the way a person would name it.
  const lcp = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = null
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const element = entry.element
            last = {
              tag: element?.tagName ?? '?',
              id: element?.id || null,
              url: entry.url || null,
              text: element?.innerText?.trim().slice(0, 48) || null,
              at: Math.round(entry.startTime)
            }
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        setTimeout(() => resolve(last), 600)
      })
  )

  await browser.close()

  const total = requests.reduce((sum, r) => sum + r.size, 0)
  console.log(
    `\n${path} at ${width}px — ${requests.length} requests, ${kb(total).trim()}\n`
  )
  // In the order the browser asked for them, which is the thing that decides
  // when the largest element can paint. Sorting by size hides exactly that.
  // In the order the browser asked for them, which is what decides when the
  // largest element can paint. Sorting by size hides exactly that.
  const zero = Math.min(...requests.map((r) => r.sentAt))
  console.log('   sent    done      size  type        url')
  for (const r of [...requests].sort((a, b) => a.sentAt - b.sentAt))
    console.log(
      `${String(Math.round(r.sentAt - zero)).padStart(5)}ms` +
        `${String(Math.round(r.doneAt - zero)).padStart(6)}ms` +
        `${kb(r.size)}  ${r.type.padEnd(10)}  ${r.url}`
    )

  if (lcp)
    console.log(
      `\nLCP: <${lcp.tag.toLowerCase()}>` +
        `${lcp.id ? ` #${lcp.id}` : ''} at ${lcp.at} ms` +
        `${lcp.url ? `\n     ${lcp.url.replace(origin, '')}` : ''}` +
        `${lcp.text ? `\n     "${lcp.text}"` : ''}`
    )

  // The trap this script was written for: a file fetched that nothing uses.
  const images = requests.filter((r) => r.url.endsWith('.webp'))
  const duplicates = new Map()
  for (const image of images) {
    const stem = image.url.replace(/-\d+\.webp$/, '')
    duplicates.set(stem, (duplicates.get(stem) ?? 0) + 1)
  }
  const twice = [...duplicates].filter(([, count]) => count > 1)
  if (twice.length) {
    console.log('\nSame picture fetched at more than one width:')
    for (const [stem, count] of twice)
      console.log(`  ${stem}: ${count} variants`)
    console.log(
      '  A preload without imagesrcset asks for a width the markup will not use.'
    )
  }
})
