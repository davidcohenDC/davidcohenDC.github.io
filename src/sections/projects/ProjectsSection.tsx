import { X } from 'lucide-react'
import { useRef } from 'react'
import { copy } from '@/content/copy'
import { moreProjects, projects } from '@/data/projects'
import { Section, SectionHeading } from '@/ui/Section'
import { sections } from '../registry'
import MoreWork from './MoreWork'
import ProjectEntry, { carries } from './ProjectEntry'
import useClips from './use-clips'
import useTagFilter from './use-tag-filter'

export default function ProjectsSection() {
  const list = useRef<HTMLDivElement>(null)
  const [tag, choose] = useTagFilter()
  useClips(list)
  const shows = (project: (typeof projects)[number]) =>
    !tag || carries(project, tag)
  const count = [...projects, ...moreProjects].filter(shows).length
  const filter = {
    tag,
    // The grid shrinks under the reader; bring its top back into view.
    choose: (next: string | null) => {
      choose(next)
      document
        .getElementById(sections.work.id)
        ?.scrollIntoView({ block: 'start' })
    }
  }
  return (
    <Section section={sections.work} className="shell section">
      <SectionHeading section={sections.work} size="landmark" />
      {/* Said aloud when it changes, so a filter is not a silent reshuffle. */}
      <p className="filter-line" role="status">
        {tag && (
          <>
            <span className="text-muted">{copy.labels.taggedWith}</span>
            <strong className="filter-tag">{tag}</strong>
            <span className="mono text-xs text-muted">
              {copy.labels.matching(count)}
            </span>
            <button
              type="button"
              className="filter-clear"
              onClick={() => filter.choose(null)}
            >
              <X size={14} aria-hidden="true" focusable="false" />
              {copy.actions.showAll}
            </button>
          </>
        )}
      </p>
      {/* A grid of modules, none of them the whole page: the section is one
          block among others, and so is each project inside it. In the page's
          own flow — an inner scroll pane hid which of the two was moving, and
          tests/portfolio.spec.ts keeps it that way. */}
      <div
        className="projects-list grid grid-cols-[minmax(0,1fr)] gap-x-(--gap-lg) gap-y-14 md:grid-cols-2"
        ref={list}
      >
        {projects.map((project) => (
          <ProjectEntry
            key={project.id}
            project={project}
            filter={filter}
            hidden={!shows(project)}
          />
        ))}
      </div>
      <MoreWork tag={tag} shows={shows} />
    </Section>
  )
}
