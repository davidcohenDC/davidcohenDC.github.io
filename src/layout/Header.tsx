import { useRef } from 'react'
import type { SectionDef } from '@/ui/Section'
import type { Origin } from '@/motion/origin'
import ThemeToggle from './ThemeToggle'
import useBalance from './use-balance'
import useScrollSpy from './use-scroll-spy'
import { copy } from '@/content/copy'

// On a phone the menu becomes a sideways scroll strip with the last item
// faded, instead of shrinking the type below a readable size.
const menuStyle =
  'ml-auto flex gap-4 text-sm md:gap-8 ' +
  'max-md:min-w-0 max-md:flex-1 max-md:-mx-2 max-md:overflow-x-auto max-md:px-2 max-md:py-1 ' +
  'max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden ' +
  'max-md:[scroll-padding-inline:--spacing(2)] ' +
  'max-md:[mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)]'

// A menu is not running text, so its links carry no underline; the section
// being read is marked by the accent and the rule that grows under it.
const menuLink =
  'relative inline-flex min-h-11 min-w-11 items-center justify-center py-3 ' +
  'text-ink transition-colors hover:text-accent aria-[current=true]:text-accent ' +
  'after:absolute after:inset-x-2 after:bottom-1 after:h-px after:origin-left ' +
  'after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 ' +
  'aria-[current=true]:after:scale-x-100 ' +
  // A preview of the mark under the pointer, a third of its width.
  '[&:not([aria-current=true]):hover]:after:scale-x-[0.35] ' +
  'max-md:shrink-0 max-md:py-2 max-md:whitespace-nowrap ' +
  'max-md:focus-visible:shadow-none max-md:focus-visible:outline-offset-1'

type Props = {
  menu: readonly SectionDef[]
  dark: boolean
  onThemeChange: (from: Origin) => void
}

export default function Header({ menu, dark, onThemeChange }: Props) {
  const balance = useBalance()
  const nav = useRef<HTMLElement>(null)
  useScrollSpy(nav)
  // The skip link travels with the header: it is the first thing the
  // keyboard reaches, and the header is the first thing on every page.
  return (
    <>
      <a className="skip-link" href="#main">
        {copy.landmarks.skipToContent}
      </a>
      <header className="theme-shift sticky top-0 z-20 border-b border-line bg-header backdrop-blur-[18px]">
        <div className="shell flex min-h-(--header-height) items-center gap-3 md:gap-8">
          <a
            className="inline-flex min-h-11 min-w-11 items-center text-xl font-bold tracking-[-0.06em]"
            href="#top"
          >
            {/* It balances on its own baseline, so that is where it turns from. */}
            <span
              aria-hidden="true"
              data-balance
              ref={balance}
              className="inline-block origin-[50%_88%]"
            >
              dc<span className="text-accent">.</span>
            </span>
            <span className="sr-only">{copy.landmarks.home}</span>
          </a>
          <nav aria-label={copy.landmarks.main} className={menuStyle} ref={nav}>
            {menu.map((section) => (
              <a
                className={menuLink}
                href={section.href ?? `#${section.id}`}
                key={section.id}
              >
                {section.nav}
              </a>
            ))}
          </nav>
          <ThemeToggle dark={dark} onToggle={onThemeChange} />
        </div>
      </header>
    </>
  )
}
