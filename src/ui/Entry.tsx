import type { ReactNode } from 'react'

// The page has one kind of object: an entry. Projects and the publication
// share it — what and when, a title, a picture, a figure, a sentence, tags,
// links — so the sections cannot drift apart a utility at a time.
//
// It comes in two layouts, and a section chooses one; the pieces below do not
// change between them, only where they sit.
//
// - `tile`: a module. Picture on top, then the words, in a grid of equals —
//   so a section of projects is a set of modules, and a new kind of thing
//   can sit beside them without the page being rebuilt around one of them.
// - `row`: the CV's grammar, for a record that is read rather than browsed:
//   a rail down the left edge for what is machine-read and for the figure,
//   the prose beside it, the picture in a third column from lg.
//
// Everything keeps one left edge on a phone. Centring the title, the date and
// the links while the paragraph stayed left gave each entry two axes.
export type EntryLayout = 'tile' | 'row'

// Children read the layout off the entry (`group-data-[layout=…]`), so a
// piece is written once and placed by its parent.
const styles = {
  tile:
    'group grid content-start gap-y-3 wrap-anywhere grid-cols-[minmax(0,1fr)] ' +
    "[grid-template-areas:'figure''meta''title''metric''body']",
  row:
    'group grid gap-x-(--gap-md) gap-y-3 border-t border-line py-10 ' +
    'wrap-anywhere first:border-t-0 first:pt-2 ' +
    "grid-cols-[minmax(0,1fr)] [grid-template-areas:'meta''title''figure''metric''body'] " +
    'md:grid-cols-[9rem_minmax(0,1fr)] md:gap-y-4 ' +
    "md:[grid-template-areas:'meta_title''metric_body''._figure'] " +
    'md:max-lg:[&>figure]:max-w-[28rem] ' +
    'lg:grid-cols-[10rem_minmax(0,1fr)_20rem] lg:grid-rows-[auto_1fr] ' +
    "lg:[grid-template-areas:'meta_title_figure''metric_body_figure']",
  meta:
    'mono m-0 flex flex-wrap items-baseline gap-x-2 text-xs text-muted [grid-area:meta] ' +
    'md:group-data-[layout=row]:flex-col md:group-data-[layout=row]:gap-y-1 ' +
    'md:group-data-[layout=row]:pt-1.5',
  title:
    'm-0 text-lg leading-tight font-semibold tracking-[-0.02em] [grid-area:title]',
  // A picture resting on the page: the top of a tile, a column of its own in
  // a row from lg.
  figure:
    'project-frame relative m-0 w-full self-start rounded-xl [grid-area:figure] ' +
    'group-data-[layout=tile]:mb-2',
  // Beside its label in a tile, above it in the rail of a row.
  metric:
    'm-0 flex items-baseline gap-2 [grid-area:metric] ' +
    'group-data-[layout=row]:flex-col group-data-[layout=row]:items-start ' +
    'group-data-[layout=row]:gap-1 md:group-data-[layout=row]:pt-1',
  metricValue: 'display text-xl leading-none text-result',
  metricLabel: 'text-xs text-muted',
  body: 'flex min-w-0 flex-col gap-3 [grid-area:body]',
  // A tile says three lines at most; the rest is one click away.
  summary: 'm-0 max-w-[62ch] text-muted group-data-[layout=tile]:line-clamp-3',
  tags: 'm-0 flex flex-wrap gap-1.5 p-0 text-xs',
  // A share of ink rather than a colour, so a tag sits on any ground.
  // 24px tall, which is the least a pointer should have to hit (WCAG 2.2
  // target size) now that a tag can be pressed.
  tag:
    'inline-flex min-h-6 items-center rounded-full ' +
    'bg-[color-mix(in_srgb,var(--color-ink)_7%,transparent)] px-2 text-ink/85',
  // Pressable, and pressed it is filled with the ink, like a key held down.
  tagFilter:
    'cursor-pointer transition-colors ' +
    'hover:bg-[color-mix(in_srgb,var(--color-ink)_14%,transparent)] ' +
    'aria-pressed:bg-ink aria-pressed:text-bg',
  signals:
    'mono m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted',
  actions:
    'flex flex-wrap items-center gap-x-5 [&_.text-link]:min-h-9 md:[&_.text-link]:min-h-11'
}

const join = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(' ')

type Children = { children: ReactNode }
type WithClass = Children & { className?: string }

export function Entry({
  id,
  titleId,
  className,
  layout = 'row',
  hidden = false,
  children
}: WithClass & {
  id: string
  titleId: string
  layout?: EntryLayout
  // Out of a filtered view, but still in the document.
  hidden?: boolean
}) {
  return (
    <article
      className={join(className, styles[layout])}
      id={id}
      hidden={hidden}
      aria-labelledby={titleId}
      data-layout={layout}
      data-reveal
    >
      {children}
    </article>
  )
}

// What kind of thing and when, down the rail.
export function EntryMeta({ kind, date }: { kind: string; date: string }) {
  return (
    <p className={styles.meta}>
      <span className="whitespace-nowrap text-ink">{date}</span>
      <span>{kind}</span>
    </p>
  )
}

export function EntryTitle({ id, children }: Children & { id: string }) {
  return (
    <h3 id={id} className={styles.title}>
      {children}
    </h3>
  )
}

export function EntryFigure({ className, children }: WithClass) {
  return <figure className={join(className, styles.figure)}>{children}</figure>
}

// The figure an entry is remembered by, in the display face and the colour
// of a result, with what it counts beneath it.
export function EntryMetric({
  value,
  label
}: {
  value: string
  label: string
}) {
  return (
    <p className={styles.metric}>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricLabel}>{label}</span>
    </p>
  )
}

export function EntryBody({ children }: Children) {
  return <div className={styles.body}>{children}</div>
}

export function EntrySummary({ className, children }: WithClass) {
  return <p className={join(className, styles.summary)}>{children}</p>
}

// Tags are a list, and with `onSelect` each one is also a filter: pressed,
// it narrows its section to what shares it, and pressed again lets go.
export function EntryTags({
  label,
  items,
  selected,
  onSelect
}: {
  label: string
  items: readonly string[]
  selected?: string | null
  onSelect?: (tag: string | null) => void
}) {
  // Safari/VoiceOver drops the list role when list-style is none.
  return (
    <ul role="list" className={styles.tags} aria-label={label}>
      {items.map((item) => (
        <li key={item} className={onSelect ? undefined : styles.tag}>
          {onSelect ? (
            <button
              type="button"
              className={`${styles.tag} ${styles.tagFilter}`}
              aria-pressed={item === selected}
              onClick={() => onSelect(item === selected ? null : item)}
            >
              {item}
            </button>
          ) : (
            item
          )}
        </li>
      ))}
    </ul>
  )
}

export function EntrySignals({ children }: Children) {
  return <p className={styles.signals}>{children}</p>
}

export function EntryActions({ children }: Children) {
  return <div className={styles.actions}>{children}</div>
}
