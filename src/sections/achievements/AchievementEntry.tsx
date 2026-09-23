import { BookOpen, FileText, Quote } from 'lucide-react'
import { profile } from '@/content/profile'
import type { Achievement, Preview } from '@/domain/achievement'
import { imageProps } from '@/media/images'
import { GitHub } from '@/ui/BrandIcons'
import {
  Entry,
  EntryActions,
  EntryBody,
  EntryFigure,
  EntryMeta,
  EntryMetric,
  EntrySummary,
  EntryTags,
  EntryTitle
} from '@/ui/Entry'
import CopyButton from '@/ui/CopyButton'
import ResourceLink from '@/ui/ResourceLink'
import { copy } from '@/content/copy'

// The first page of the record, as a sheet resting on the page: white,
// whatever the theme, because that is the colour of the paper it was printed
// on, and faded at the foot so it reads as a page rather than a screenshot.
function PreviewFigure({ preview }: { preview: Preview }) {
  return (
    <EntryFigure>
      <img
        {...imageProps(preview.image, '320px')}
        className="block max-h-[20rem] w-full bg-white object-cover object-top"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-2 text-xs text-muted">
        <BookOpen size={14} aria-hidden="true" focusable="false" />
        {preview.caption}
        {[preview.license, preview.archive]
          .filter((record) => record !== undefined)
          .map((record) => (
            <a
              key={record.href}
              className="link inline-flex min-h-6 items-center"
              href={record.href}
            >
              {record.label}
            </a>
          ))}
      </figcaption>
    </EntryFigure>
  )
}

// The byline as the journal printed it, with David's name in the ink and the
// others in the grey: where he stands in it, without a word added.
function Authors({ authors }: { authors: readonly string[] }) {
  return (
    <p className="m-0 text-sm text-muted">
      {authors.map((author, index) => (
        <span key={author}>
          {index > 0 && ', '}
          {author === profile.name ? (
            <strong className="font-semibold text-ink">{author}</strong>
          ) : (
            author
          )}
        </span>
      ))}
    </p>
  )
}

export default function AchievementEntry({
  achievement
}: {
  achievement: Achievement
}) {
  const titleId = `${achievement.id}-title`
  const { preview, authors, evidence, code } = achievement
  // The journal is the figure: the thing a reader of the section remembers.
  // Everything after its name in `where` is what it counts.
  const [journal, ...where] = achievement.where.split(' · ')
  return (
    <Entry id={`achievement-${achievement.id}`} titleId={titleId}>
      <EntryMeta kind={achievement.kind} date={achievement.date} />
      <EntryTitle id={titleId}>{achievement.title}</EntryTitle>
      {preview && <PreviewFigure preview={preview} />}
      <EntryMetric value={journal} label={where.join(' · ')} />
      <EntryBody>
        <Authors authors={authors} />
        <EntrySummary>{achievement.summary}</EntrySummary>
        <EntryTags label={copy.lists.aboutRecord} items={achievement.facts} />
        <EntryActions>
          <ResourceLink
            href={evidence.href}
            icon={FileText}
            context={evidence.context}
          >
            {evidence.label}
          </ResourceLink>
          {code && (
            <ResourceLink href={code.href} icon={GitHub} context={code.context}>
              {code.label}
            </ResourceLink>
          )}
          <CopyButton
            value={achievement.citation}
            label={copy.actions.copyCitation}
            done={copy.labels.copied}
            icon={Quote}
          >
            {copy.actions.cite}
          </CopyButton>
        </EntryActions>
      </EntryBody>
    </Entry>
  )
}
