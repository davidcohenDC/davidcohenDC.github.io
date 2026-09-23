import type { ElementType, ReactNode } from 'react'
import { ArrowUp } from 'lucide-react'

// The controls that float in the corner of a long page, as one element used
// by every page: the portfolio and the CV.
//
// A group arrives once the page has been scrolled past the first screen and
// leaves when the reader is back at the top; the way back to the top wears a
// ring of how much of the page is behind. Both are behaviour of the element,
// not of the page: the markup says what it is (`data-floating`,
// `data-scroll-progress`) and the one script every page carries
// (scripts/page-scripts.ts) does the rest, so the same element works on the
// hydrated portfolio and on the static documents alike. back-to-top.css is
// how it looks and moves.

const control =
  'back-to-top round-control relative size-12 bg-surface text-accent shadow-card'

export function Floating({ children }: { children: ReactNode }) {
  return (
    <div className="doc-actions" data-floating>
      {children}
    </div>
  )
}

type LinkProps = {
  href: string
  label: string
  icon: ElementType
  download?: boolean
}

export function FloatingLink({
  href,
  label,
  icon: Icon,
  download = false
}: LinkProps) {
  return (
    <a
      className={control}
      href={href}
      aria-label={label}
      download={download || undefined}
    >
      <Icon size={22} aria-hidden="true" focusable="false" />
    </a>
  )
}

// The way back to the top, with its ring: an SVG stroke as long as
// `--progress` (0 to 1) says, which the page script writes on the link.
export function ScrollTop({ label }: { label: string }) {
  return (
    <a className={control} href="#top" aria-label={label} data-scroll-progress>
      <svg className="progress-ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="23" pathLength="1" />
      </svg>
      <ArrowUp size={22} aria-hidden="true" focusable="false" />
    </a>
  )
}
