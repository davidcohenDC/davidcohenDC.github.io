import { ask } from '@/layout/asking'
import { spy } from '@/layout/scroll-spy'
import { centreOf } from '@/motion/origin'
import { follow, isDark, switchTheme } from '@/theme/theme'

// What the CV does once it is read. It ships no framework, so this is its
// only script, and every part of it is the same code the portfolio runs
// through its React hooks. The
// menu marks the section being read (scroll-spy.ts), the theme control asks
// to be pressed (asking.ts) and switches the theme the portfolio's way
// (theme.ts). Built by Vite as an entry of its own.

// Printing is a thing only a script can offer, so the button waits for one.
for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-print]'
)) {
  button.hidden = false
  button.addEventListener('click', () => window.print())
}

const menu = document.querySelector<HTMLElement>('nav[data-spy]')
if (menu) spy(menu)

// The control's two names are in its markup, from content/copy.ts, so this
// script keeps no words of its own.
for (const toggle of document.querySelectorAll<HTMLButtonElement>(
  '[data-theme-toggle]'
)) {
  const name = () =>
    toggle.setAttribute(
      'aria-label',
      (isDark() ? toggle.dataset.labelLight : toggle.dataset.labelDark) ?? ''
    )
  name()
  follow(name)
  ask(toggle)
  toggle.addEventListener('click', () =>
    switchTheme(!isDark(), centreOf(toggle), name)
  )
}
