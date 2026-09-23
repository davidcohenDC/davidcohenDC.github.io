import type { ReactNode } from 'react'

// A block of the page. Its id is the anchor the menu links to, and the
// heading's id is derived from it, so the two cannot drift apart.
export type SectionDef = {
  id: string
  nav: string
  title: string
  // Its place on the page, set in the rail beside the title. A number says
  // where a reader is in a sequence; the icon tile it replaces said only that
  // a heading was a heading.
  number: string
  // Where the menu entry goes, when that is not a place on this page. The CV
  // is a page of this site and belongs in the menu like any other stop; it
  // just happens to be reached by its address rather than by its anchor.
  href?: string
}

export const titleId = (section: SectionDef) => `${section.id}-title`

type SectionProps = {
  section: SectionDef
  className?: string
  children: ReactNode
}

export function Section({ section, className, children }: SectionProps) {
  return (
    <section
      className={className}
      id={section.id}
      tabIndex={-1}
      aria-labelledby={titleId(section)}
    >
      {children}
    </section>
  )
}

// `landmark` is the portfolio's: the number and the title in the display
// face, the number in the entries' rail so the two share a left edge.
// `document` is the CV's, where a heading is a label to scan past.
const headingStyles = {
  landmark:
    'section-title landmark display m-0 grid items-baseline gap-x-(--gap-md) text-xl ' +
    'grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[9rem_minmax(0,1fr)] ' +
    'lg:grid-cols-[10rem_minmax(0,1fr)]',
  document: 'section-title flex items-baseline gap-3'
}

type HeadingProps = {
  section: SectionDef
  className?: string
  size?: keyof typeof headingStyles
}

export function SectionHeading({
  section,
  className = '',
  size = 'document'
}: HeadingProps) {
  return (
    <header className={`section-heading ${className}`.trim()} data-reveal>
      <h2 id={titleId(section)} className={headingStyles[size]}>
        <span
          className={
            size === 'landmark' ? 'text-muted' : 'mono text-xs text-muted'
          }
          aria-hidden="true"
        >
          {section.number}
        </span>
        <span>{section.title}</span>
      </h2>
    </header>
  )
}
