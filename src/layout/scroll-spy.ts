import { motionAllowed } from '@/motion/raf'

// How far down the viewport a section's top must pass to become current.
const READING_LINE = 1 / 3

// Marks the menu link of the section being read. It reads positions rather
// than intersections: the last section is shorter than any middle band and
// sits against the footer, so an observer could never mark it. At the bottom
// of the page the last section is current by definition.
//
// Plain DOM, used by the portfolio (use-scroll-spy.ts) and the documents
// (documents/client.ts) alike, so both menus mark the same section at the
// same line. Returns its own undoing.
export function spy(menu: HTMLElement) {
  const links = new Map<string, HTMLAnchorElement>()
  // Only the entries that point at this page: one of them is a link to
  // another, and a section that is not here can never be the one being read.
  for (const link of menu.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
    links.set(link.hash.slice(1), link)

  let tops: { id: string; top: number }[] = []
  let pending = 0

  // On a phone the menu is wider than the screen and scrolls sideways, so
  // marking the current section is not enough: the mark can be off the
  // edge. The strip follows the page, which is the only way the menu can
  // answer "where am I" on a narrow screen.
  let marked: HTMLAnchorElement | undefined
  const follow = (link: HTMLAnchorElement | undefined) => {
    if (!link || link === marked) return
    marked = link
    if (menu.scrollWidth <= menu.clientWidth + 1) return
    const strip = menu.getBoundingClientRect()
    const item = link.getBoundingClientRect()
    const to =
      menu.scrollLeft +
      (item.left - strip.left) -
      (strip.width - item.width) / 2
    menu.scrollTo({
      left: to,
      behavior: motionAllowed() ? 'smooth' : 'auto'
    })
  }

  const mark = () => {
    pending = 0
    if (!tops.length) return
    const line = window.scrollY + window.innerHeight * READING_LINE
    const atBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2
    let current = ''
    if (atBottom) current = tops[tops.length - 1].id
    else
      for (const section of tops) if (section.top <= line) current = section.id
    for (const [id, link] of links)
      if (id === current) link.setAttribute('aria-current', 'true')
      else link.removeAttribute('aria-current')
    follow(links.get(current))
  }

  // Measured on resize only, never per frame.
  const measure = () => {
    tops = [...links.keys()]
      .map((id) => ({ id, node: document.getElementById(id) }))
      .filter((section) => section.node)
      .map(({ id, node }) => ({
        id,
        top: node!.getBoundingClientRect().top + window.scrollY
      }))
      .sort((a, b) => a.top - b.top)
    mark()
  }

  const onScroll = () => {
    if (!pending) pending = requestAnimationFrame(mark)
  }

  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measure)
  const observer = window.ResizeObserver ? new ResizeObserver(measure) : null
  observer?.observe(document.body)
  return () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', measure)
    observer?.disconnect()
    cancelAnimationFrame(pending)
  }
}
