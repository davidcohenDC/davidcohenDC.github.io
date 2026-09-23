import type { ReactNode } from 'react'

// One entry of the CV, in the page's grammar with one difference that the
// page does not need: a column of its own for when and where.
//
// The portfolio's entry keeps its 18rem column for a picture and lets the
// meta run full width. A CV is read down the left edge — a reader scanning
// for dates should never have to hunt for them — so here that column holds
// the dates, set in the mono face and aligned to the rule between the two.
// 12rem rather than 18: a date is not a picture, and the text wants the room.
//
// Everything else is the site's: the hairline between entries, the 4px
// rhythm, the five sizes, the muted register for what is secondary.

const entry =
  'cv-entry grid grid-cols-[minmax(0,1fr)] gap-1.5 border-b border-line py-5 ' +
  'wrap-anywhere last:border-b-0 ' +
  'md:grid-cols-[12rem_minmax(0,1fr)] md:items-start md:gap-x-8'

// On a phone the dates come first and small, which is also the reading order
// a CV wants: when, then what.
const when = 'mono m-0 text-xs text-muted md:pt-1 md:text-right'

const row =
  'grid grid-cols-[minmax(0,1fr)] gap-1.5 border-b border-line py-4 ' +
  'last:border-b-0 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-x-8'

export default function CvEntry({
  id,
  titleId,
  dates,
  children
}: {
  id?: string
  titleId: string
  dates: ReactNode
  children: ReactNode
}) {
  return (
    <article className={entry} id={id} aria-labelledby={titleId}>
      <p className={when}>{dates}</p>
      <div className="flex min-w-0 flex-col gap-1.5">{children}</div>
    </article>
  )
}

// A title stays in the page's ink even when it is a link. The portfolio sets
// titles in ink and lets a separate accent link carry the destination; here
// the title itself has to be the link, so it keeps the weight and the colour
// of a heading and takes a quiet underline that warms to the accent on hover.
const titleLink =
  '[&_a]:underline [&_a]:decoration-line [&_a]:decoration-1 ' +
  '[&_a]:underline-offset-4 [&_a:hover]:decoration-accent ' +
  '[&_a:hover]:text-accent'

// A row of the skills table: the same two columns as an entry, so the page
// keeps one rule down its left edge from the first line to the last.
export function CvSkillRow({
  label,
  children
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className={`cv-entry ${row}`}>
      <dt className={`${when} md:pt-0.5`}>{label}</dt>
      <dd className="m-0 max-w-[68ch] text-sm">{children}</dd>
    </div>
  )
}

export function CvEntryTitle({
  id,
  children
}: {
  id: string
  children: ReactNode
}) {
  return (
    <h3
      id={id}
      className={`m-0 text-lg leading-tight font-semibold tracking-[-0.02em] ${titleLink}`}
    >
      {children}
    </h3>
  )
}

// Where the work happened: the line under the title, in the register the
// portfolio uses for a repository's category.
export function CvEntryWhere({ children }: { children: ReactNode }) {
  return <p className="mono m-0 text-xs text-muted">{children}</p>
}

export function CvEntryText({ children }: { children: ReactNode }) {
  return <p className="m-0 max-w-[68ch] text-sm">{children}</p>
}

// The claims a CV is allowed to make, as a list of what was decided.
export function CvEntryPoints({ items }: { items: readonly string[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">
      {items.map((item) => (
        <li key={item} className="relative max-w-[68ch] pl-4 text-muted">
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 text-accent"
          >
            ·
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

// The one figure an entry is allowed to shout, in the colour the page keeps
// for what matters, with the words that make it mean something beside it.
export function CvEntryMetric({
  value,
  label
}: {
  value: string
  label: string
}) {
  return (
    <p className="m-0 flex flex-wrap items-baseline gap-x-2 text-sm">
      <strong className="mono text-base text-accent">{value}</strong>
      <span className="text-muted">{label}</span>
    </p>
  )
}
