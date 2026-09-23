import type { Origin } from '@/motion/origin'
import { motionAllowed } from '@/motion/raf'

// The theme, once: where the choice is kept, how it is read, how it is put
// on the page, and how a change is shown. Everything that touches the theme
// goes through here — the script that sets it before the first paint
// (boot.ts), the portfolio's hook (use-theme.ts) and the documents' script
// (documents/client.ts) — so there is one storage key, one pair of browser
// colours and one reveal, and none of them can drift from another.
//
// Plain DOM, no React: the documents ship no framework.

const STORAGE_KEY = 'theme'
const BROWSER_COLOR = { dark: '#282c34', light: '#fdf6e3' }
const PREFERS_DARK = '(prefers-color-scheme: dark)'

function saved() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // Storage may be blocked; the system's preference stands in.
    return null
  }
}

// What the visitor chose, or what their system prefers if they never did.
export function wantsDark() {
  const choice = saved()
  return (
    choice === 'dark' ||
    (choice !== 'light' && window.matchMedia(PREFERS_DARK).matches)
  )
}

export function isDark() {
  return document.documentElement.dataset.theme === 'dark'
}

export function save(dark: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  } catch {
    // Storage may be blocked; the choice still holds for this visit.
  }
}

export function apply(dark: boolean) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? BROWSER_COLOR.dark : BROWSER_COLOR.light)
}

// Follow the system when it changes and the visitor has not chosen, another
// tab when it does choose, and a prerendered page when it is finally shown
// (it read the theme before the visitor arrived). Returns its own undoing.
export function follow(update: () => void) {
  const media = window.matchMedia(PREFERS_DARK)
  media.addEventListener('change', update)
  window.addEventListener('storage', update)
  document.addEventListener('prerenderingchange', update)
  return () => {
    media.removeEventListener('change', update)
    window.removeEventListener('storage', update)
    document.removeEventListener('prerenderingchange', update)
  }
}

// The new theme spreads from the control that was pressed: a circle opening
// from its centre until it covers the farthest corner. A view transition
// draws it — the old page is a still picture underneath, the new one shows
// through the circle — and transitions.css holds the circle. Without the
// API, or with motion turned down, the change is simply made.
//
// The circle is animated from here, with the Web Animations API and its
// centre and radius in plain pixels, rather than by a CSS keyframe reading
// custom properties: a clip-path animation with fixed values is one the
// browser can hand to the compositor, and on a phone the keyframe version
// was painted on the main thread — a stall at the start and a lurch at the
// end. The curve starts fast and settles, so the first frames, which are
// the ones a busy phone drops, are not the ones that carry the movement.
const REVEAL = { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }

export function reveal(from: Origin | undefined, change: () => void) {
  const root = document.documentElement
  if (!from || !motionAllowed() || !document.startViewTransition)
    return change()
  const radius = Math.hypot(
    Math.max(from.x, window.innerWidth - from.x),
    Math.max(from.y, window.innerHeight - from.y)
  )
  const at = `at ${from.x}px ${from.y}px`
  root.classList.add('theme-reveal')
  const transition = document.startViewTransition(change)
  void transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px ${at})`, `circle(${radius}px ${at})`] },
        { ...REVEAL, pseudoElement: '::view-transition-new(root)' }
      )
    )
    .catch(() => {})
  void transition.finished.finally(() => root.classList.remove('theme-reveal'))
}

// Switch to a theme from a control: keep the choice, and show it spreading
// from where the control is. `then` runs inside the change, for whatever else
// has to be on the page before the browser takes its picture of it.
export function switchTheme(dark: boolean, from?: Origin, then?: () => void) {
  save(dark)
  reveal(from, () => {
    apply(dark)
    then?.()
  })
}
