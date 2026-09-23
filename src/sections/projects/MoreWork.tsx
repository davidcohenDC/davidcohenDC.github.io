import { ArrowUpRight } from 'lucide-react'
import { profile } from '@/content/profile'
import { moreProjects } from '@/data/projects'
import type { Project } from '@/domain/project'
import ProjectEntry from './ProjectEntry'
import { copy } from '@/content/copy'

type Props = { tag: string | null; shows: (project: Project) => boolean }

// Folded away: the rows stay in the document for search, screen readers and
// print, without doubling the section's height. Under a filter it opens on
// the rows that match, and steps aside when none does.
export default function MoreWork({ tag, shows }: Props) {
  const matching = moreProjects.filter(shows)
  return (
    <details
      className="disclosure mt-4"
      aria-labelledby="more-title"
      open={tag ? true : undefined}
      hidden={Boolean(tag) && matching.length === 0}
    >
      <summary>
        <span className="eyebrow text-muted" id="more-title">
          {copy.lists.moreOnGitHub}
        </span>
        <span className="mono text-xs text-muted">
          {copy.labels.more(matching.length)}
        </span>
      </summary>
      <ul
        role="list"
        className="m-0 list-none border-t border-line p-0"
        data-reveal-group
      >
        {moreProjects.map((project) => (
          <ProjectEntry
            key={project.url}
            project={project}
            variant="line"
            hidden={!shows(project)}
          />
        ))}
      </ul>
      <a
        className="more-all link mt-4 inline-flex min-h-11 items-center gap-1 text-sm"
        href={`${profile.github}?tab=repositories`}
      >
        {copy.actions.allRepositories}
        <ArrowUpRight size={16} aria-hidden="true" focusable="false" />
      </a>
    </details>
  )
}
