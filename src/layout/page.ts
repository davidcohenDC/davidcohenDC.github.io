// What every page does, on the hydrated portfolio and on the static documents
// alike — so none of it is React's. Plain DOM, typed, run before anything
// else from an inline script (page-entry.ts, compiled by
// scripts/inline-scripts.ts).

// Where the Speculation Rules API is not understood, the other pages are
// still fetched ahead with `<link rel="prefetch">`, which Firefox honours.
export function prefetchWithout(pages: readonly string[]) {
  if (HTMLScriptElement.supports?.('speculationrules')) return
  for (const url of pages)
    if (url !== location.pathname) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      document.head.append(link)
    }
}

// A link to the page just come from goes back to it instead, from the
// back-forward cache, as it was left. "Just come from" is the entry before
// this page's first one: a jump inside this page (the way back to the top, a
// menu anchor) adds entries of its own, which are skipped rather than
// mistaken for the page behind — going back one step from one of those only
// lands lower down this same page. The Navigation API lists the entries;
// where it is missing, the referrer stands in until the first jump inside
// the page, after which the link is simply followed.
type Behind = { url: URL; go: () => void }

type NavigationEntry = { url: string | null; key: string; index: number }
type Navigation = {
  currentEntry: NavigationEntry | null
  entries(): NavigationEntry[]
  traverseTo(key: string): unknown
}

export function goBackToWhereYouCame() {
  let jumped = false
  addEventListener('hashchange', () => {
    jumped = true
  })

  const behind = (): Behind | null => {
    const nav = (window as Window & { navigation?: Navigation }).navigation
    if (nav?.currentEntry) {
      const entries = nav.entries()
      let index = nav.currentEntry.index
      while (
        index > 0 &&
        new URL(entries[index - 1].url ?? location.href).pathname ===
          location.pathname
      )
        index -= 1
      const entry = entries[index - 1]
      return entry?.url
        ? { url: new URL(entry.url), go: () => nav.traverseTo(entry.key) }
        : null
    }
    if (jumped || !document.referrer || history.length < 2) return null
    return { url: new URL(document.referrer), go: () => history.back() }
  }

  addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]')
    if (
      !(link instanceof HTMLAnchorElement) ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute('download')
    )
      return
    const to = new URL(link.href)
    if (to.origin !== location.origin || to.pathname === location.pathname)
      return
    const previous = behind()
    if (
      !previous ||
      previous.url.origin !== location.origin ||
      previous.url.pathname !== to.pathname
    )
      return
    event.preventDefault()
    previous.go()
  })
}

// The corner controls (ui/Floating.tsx): a group marked `data-floating`
// arrives past the first screen, and the way back to the top, marked
// `data-scroll-progress`, is told how much of the page is behind as
// `--progress`, 0 to 1, for its ring. At most once a frame.
export function cornerControls(showAfter: number) {
  let frame = 0
  const update = () => {
    frame = 0
    const end = document.documentElement.scrollHeight - innerHeight
    const progress = end > 0 ? Math.min(scrollY / end, 1) : 0
    for (const group of document.querySelectorAll('[data-floating]'))
      group.classList.toggle('is-visible', scrollY > showAfter)
    for (const ring of document.querySelectorAll<HTMLElement>(
      '[data-scroll-progress]'
    ))
      ring.style.setProperty('--progress', progress.toFixed(4))
  }
  addEventListener(
    'scroll',
    () => {
      if (!frame) frame = requestAnimationFrame(update)
    },
    { passive: true }
  )
  // Restored from the back-forward cache, or opened already scrolled.
  addEventListener('pageshow', update)
}
