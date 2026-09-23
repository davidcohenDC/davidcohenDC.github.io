import { copy } from '@/content/copy'
import { documentCopy } from '@/content/document-copy'
import ThemeDial from '@/ui/ThemeDial'
import type { SectionDef } from '@/ui/Section'

// The site's header, on a page with no React on it.
//
// The CV is rendered once, to static HTML, and ships no
// framework — which is a property worth keeping, and also the reason this is
// not the portfolio's Header component: that one needs React for the theme
// and for the section being read. So the markup is the same and the
// behaviour comes from the documents' script (documents/client.ts), which
// runs the same code the portfolio's hooks wrap.

const menuStyle =
  'ml-auto flex gap-4 text-sm md:gap-8 ' +
  'max-md:min-w-0 max-md:flex-1 max-md:-mx-2 max-md:overflow-x-auto max-md:px-2 max-md:py-1 ' +
  'max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden ' +
  'max-md:[mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)]'

// The same mark the portfolio's menu uses for the section being read: the
// accent, and a rule that grows under it.
const menuLink =
  'relative inline-flex min-h-11 items-center justify-center py-3 ' +
  'text-ink transition-colors hover:text-accent aria-[current=true]:text-accent ' +
  'after:absolute after:inset-x-2 after:bottom-1 after:h-px after:origin-left ' +
  'after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 ' +
  'aria-[current=true]:after:scale-x-100 ' +
  // A preview of the mark under the pointer, a third of its width.
  '[&:not([aria-current=true]):hover]:after:scale-x-[0.35] ' +
  'max-md:shrink-0 max-md:py-2 max-md:whitespace-nowrap'

export default function DocumentHeader({
  menu,
  label
}: {
  menu: readonly SectionDef[]
  label: string
}) {
  return (
    <header className="document-header theme-shift sticky top-0 z-20 border-b border-line bg-header backdrop-blur-[18px]">
      <div className="shell flex min-h-(--header-height) items-center gap-3 md:gap-8">
        <a
          className="inline-flex min-h-11 min-w-11 items-center text-xl font-bold tracking-[-0.06em]"
          href="/"
        >
          <span aria-hidden="true">
            dc<span className="text-accent">.</span>
          </span>
          <span className="sr-only">{documentCopy.landmarks.home}</span>
        </a>
        <nav aria-label={label} className={menuStyle} data-spy>
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
        <button
          className="theme-toggle round-control relative size-11 shrink-0 cursor-pointer"
          type="button"
          data-theme-toggle
          // client.ts names the control; the words are handed to it here so
          // the script keeps no copy of its own.
          data-label-dark={copy.actions.toDark}
          data-label-light={copy.actions.toLight}
        >
          <ThemeDial />
        </button>
      </div>
    </header>
  )
}
