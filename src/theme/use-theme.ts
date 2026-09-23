import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import type { Origin } from '@/motion/origin'
import { apply, follow, switchTheme, wantsDark } from './theme'

// The portfolio's side of the theme: React's copy of it, kept in step with
// the page. Where the choice lives and how a change is shown are theme.ts's;
// boot.ts has already put the right theme on the page before this runs.

// The drawing the other theme will want. Fetched when the browser has
// nothing better to do, never at load: at load it would be a picture nobody
// has asked to see, competing with the one they are looking at.
function prefetchOtherPortrait(dark: boolean) {
  const next = dark ? 'david-wave' : 'david-working'
  const idle =
    window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 1200))
  idle(() => {
    new Image().src = `/hero/${next}.svg`
  })
}

// Half a second of `theme-changing` on the root, which is what the portrait's
// animation hangs off. Long enough to play, short enough that two quick
// presses do not stack.
function markChange() {
  const root = document.documentElement
  root.classList.add('theme-changing')
  window.setTimeout(() => root.classList.remove('theme-changing'), 500)
}

export default function useTheme() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const update = () => {
      const next = wantsDark()
      apply(next)
      setDark(next)
    }
    update()
    prefetchOtherPortrait(wantsDark())
    return follow(update)
  }, [])

  function toggleTheme(from?: Origin) {
    const next = !dark
    switchTheme(next, from, () => {
      markChange()
      // Inside the transition the new state has to be on the page before the
      // browser takes its picture of it.
      flushSync(() => setDark(next))
    })
    prefetchOtherPortrait(next)
  }

  return { dark, toggleTheme }
}
