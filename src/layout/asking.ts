import { motionAllowed } from '@/motion/raf'

// One full breath of the theme control per this much of the page.
const PERIOD = 720

// The theme control asks to be pressed, and it asks in the reader's own
// time: `--ask`, from 0 to 1, is a function of how far down the page is, so
// it rises going down and falls coming back up, and a page standing still
// leaves it standing still. Zero at the top: the first screen belongs to the
// name.
//
// Written on the button and nowhere else. A custom property on `:root` costs
// a style recalculation of the whole document every frame — 70ms of blocking
// time when that was last measured here — and this needs one element.
//
// Plain DOM, used by the portfolio (use-asking.ts) and the documents
// (documents/client.ts) alike. Returns its own undoing.
export function ask(button: HTMLElement) {
  if (!motionAllowed()) return () => {}
  let pending = 0
  const update = () => {
    pending = 0
    const turn = (window.scrollY / PERIOD) * Math.PI * 2
    button.style.setProperty('--ask', (0.5 - 0.5 * Math.cos(turn)).toFixed(3))
  }
  const onScroll = () => {
    if (!pending) pending = requestAnimationFrame(update)
  }
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(pending)
    button.style.removeProperty('--ask')
  }
}
