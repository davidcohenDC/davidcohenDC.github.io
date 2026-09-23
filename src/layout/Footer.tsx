import { FileText, Mail } from 'lucide-react'
import carbon from '@/data/carbon.json'
import { independence, profile } from '@/content/profile'
import { syncedAt } from '@/data/snapshot'
import { GitHub, LinkedIn } from '@/ui/BrandIcons'
import ResourceLink from '@/ui/ResourceLink'
import { formatDate } from '@/ui/format'
import { copy } from '@/content/copy'

// The end of the page, which now also ends the conversation.
//
// Contact was a section of its own until it was not worth one: three links
// and two sentences, given a heading, an anchor and a place in the menu, and
// sitting immediately above a footer that was already where a reader looks
// last. It is a line here instead, in the same register as the lines under
// it — the page ends once, and the ending is level.
const row = 'flex flex-wrap items-center gap-x-6 gap-y-2'

export default function Footer() {
  return (
    <footer
      className={`shell border-t border-line pt-6 pb-24 text-sm text-muted md:pb-8`}
      id="contact"
      tabIndex={-1}
    >
      <div className={`${row} [&_.text-link]:min-h-9`}>
        <ResourceLink
          href={`mailto:${profile.email}`}
          context={copy.hints.sendEmail}
          icon={Mail}
        >
          {profile.email}
        </ResourceLink>
        <ResourceLink href={profile.github} icon={GitHub}>
          {copy.actions.github}
        </ResourceLink>
        <ResourceLink href={profile.linkedin} icon={LinkedIn}>
          {copy.actions.linkedin}
        </ResourceLink>
        <ResourceLink
          href="/cv.html"
          icon={FileText}
          context={copy.hints.cvFormats}
        >
          {copy.actions.cv}
        </ResourceLink>
      </div>

      <div className={`${row} mt-3`}>
        <p>
          Read from GitHub, Crossref and PyPI on{' '}
          <time dateTime={syncedAt}>{formatDate(syncedAt)}</time>
        </p>
        <p>{independence}</p>
        {/* Written by scripts/performance.mjs from the measured build. */}
        <p className="mr-auto">
          {carbon.grams} g CO<sub>2</sub> a visit · {carbon.rating} ·{' '}
          {carbon.source}
        </p>
        <a className="link flex min-h-9 items-center" href="#top">
          {copy.actions.backToTop} ↑
        </a>
      </div>
    </footer>
  )
}
