import type { ReactNode } from 'react'
import type { Project } from '@/domain/project'
import { EntrySignals } from '@/ui/Entry'
import { formatDate } from '@/ui/format'
import Glyph, { type GlyphName } from '@/ui/Glyph'

// Only the build state carries a colour, because there the colour is the
// information.
const tones = {
  good: 'text-signal',
  bad: 'font-semibold text-ink'
}

function Signal({
  icon,
  tone,
  children
}: {
  icon: GlyphName
  tone?: keyof typeof tones
  children: ReactNode
}) {
  return (
    <span className={`flex items-center gap-1 ${tone ? tones[tone] : ''}`}>
      <Glyph name={icon} />
      {children}
    </span>
  )
}

// Everything on this line is fetched, never written here. Any of it may be
// missing, and the line just gets shorter.
export default function ProjectSignals({ project }: { project: Project }) {
  // Licence and stars are left to GitHub: four stars is not a reason to
  // read on, and a licence is a question for whoever is about to use it.
  // Nor the date of the last push: the years are already on the card.
  const { release, checks, published } = project
  const passing = checks?.conclusion === 'success'
  return (
    <EntrySignals>
      {release && (
        <Signal icon="tag">
          {release.tag} · {formatDate(release.published)}
        </Signal>
      )}
      {checks && (
        <Signal
          icon={passing ? 'check' : 'cross'}
          tone={passing ? 'good' : 'bad'}
        >
          {passing ? 'checks passing' : `checks ${checks.conclusion}`}
        </Signal>
      )}
      {published && (
        <Signal icon="box">
          {published.name} {published.version} on PyPI
          {published.downloadsLastMonth !== null &&
            ` · ${published.downloadsLastMonth.toLocaleString('en')} installs a month`}
        </Signal>
      )}
    </EntrySignals>
  )
}
