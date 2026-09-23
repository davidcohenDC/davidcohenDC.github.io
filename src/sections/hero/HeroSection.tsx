import { ArrowDown, Mail } from 'lucide-react'
import { useRef } from 'react'
import { copy } from '@/content/copy'
import { profile } from '@/content/profile'
import { achievements } from '@/data/achievements'
import usePointerLight from '@/motion/use-pointer-light'
import { GitHub } from '@/ui/BrandIcons'
import CopyButton from '@/ui/CopyButton'
import ResourceLink from '@/ui/ResourceLink'
import { sections } from '../registry'
import Portrait from './Portrait'

// The first screen is the name, and the name is the largest thing on the page
// by a distance: set in the display cut, one word to a line, so that it is a
// landmark rather than a heading. Everything else on the screen is one lead
// sentence, one line of facts, the paper and the ways in — and every word of
// it is data: the profile's, the paper's record, the interface's own labels.
// Nothing is written here.
//
// Phones: the drawing beside the name, the copy full width below it. Wider:
// the drawing takes a column of its own beside both rows and stands on the
// rule that closes the hero, which is the only place on the page where a
// picture is allowed to set the height of a block.
const hero =
  'hero shell grid items-end gap-x-4 pt-[calc(var(--section-gap)*1.1)] ' +
  "grid-cols-[minmax(0,1fr)_132px] [grid-template-areas:'title_portrait''copy_copy'] " +
  'md:grid-cols-[minmax(0,1fr)_240px] md:gap-x-(--gap-lg) ' +
  "md:[grid-template-areas:'title_portrait''copy_portrait'] " +
  'lg:grid-cols-[minmax(0,1fr)_300px]'

// The latest record, named once; the entry itself is a section away.
const latest = achievements[0]

export default function HeroSection() {
  const [first, ...rest] = profile.name.split(' ')
  const ground = useRef<HTMLElement>(null)
  usePointerLight(ground)
  return (
    <section
      ref={ground}
      className="hero-ground relative border-b border-line"
      aria-labelledby="hero-title"
    >
      <div className={hero}>
        {/* One word to a line; the space stays in the text so the name is
            read, copied and matched as the two words it is. */}
        <h1
          id="hero-title"
          className="display m-0 self-end pb-2 text-display tracking-[-0.01em] [grid-area:title] md:pb-8"
        >
          <span className="block">{first} </span>
          <span className="block">{rest.join(' ')}</span>
        </h1>
        <figure className="portrait m-0 self-end [grid-area:portrait]">
          <Portrait />
        </figure>
        <div
          className="mt-6 min-w-0 pb-(--section-gap) [grid-area:copy] md:mt-0"
          data-reveal-group
        >
          <p className="mb-3 max-w-[32ch] text-lg leading-snug font-medium tracking-[-0.01em]">
            {profile.builds}
          </p>
          <p className="mb-6 max-w-measure text-sm text-muted">
            {[profile.jobTitle, ...profile.academicLine].join(' · ')}
          </p>
          {latest && (
            <a
              className="hero-publication mb-6 flex max-w-measure items-baseline gap-x-2 text-sm"
              href={`#${sections.achievements.id}`}
            >
              {/* Short on purpose: the kind, the journal and the year, from
                  the record. The title is a section away, with the rest. */}
              <span>
                <span className="text-muted">{latest.kind} · </span>
                <strong className="hero-publication-title font-semibold">
                  {latest.journal}
                </strong>
                <span className="text-muted">, {latest.date}</span>
              </span>
              <ArrowDown
                className="shrink-0 translate-y-0.5 text-accent"
                size={16}
                aria-hidden="true"
                focusable="false"
              />
            </a>
          )}
          <div className="hero-actions flex flex-wrap items-center gap-x-6 gap-y-2">
            <ResourceLink
              className="button primary"
              context={copy.hints.cvFormats}
              href="/cv.html"
            >
              {copy.actions.viewCv}
            </ResourceLink>
            <span className="inline-flex items-center">
              <ResourceLink icon={Mail} href={`mailto:${profile.email}`}>
                {profile.email}
              </ResourceLink>
              <CopyButton
                value={profile.email}
                label={copy.actions.copyEmail}
                done={copy.labels.copied}
              />
            </span>
            <ResourceLink icon={GitHub} href={profile.github}>
              {copy.actions.github}
            </ResourceLink>
          </div>
        </div>
      </div>
    </section>
  )
}
