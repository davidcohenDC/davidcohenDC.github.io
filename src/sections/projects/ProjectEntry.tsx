import { copy } from '@/content/copy'
import type { Project } from '@/domain/project'
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
import ResourceLink from '@/ui/ResourceLink'
import ProjectCover from './ProjectCover'
import ProjectSignals from './ProjectSignals'

export type Variant = 'card' | 'line'

// A filter the entry takes part in: the tag in force, and how to change it.
export type Filter = {
  tag: string | null
  choose: (tag: string | null) => void
}

type Props = {
  project: Project
  variant?: Variant
  filter?: Filter
  hidden?: boolean
}

// One widget for every repository. `card` is the module, `line` the compact
// row; both read the same Project, so a repository moves between them by its
// position in content/sources.ts alone.
export default function ProjectEntry({
  project,
  variant = 'card',
  filter,
  hidden = false
}: Props) {
  return variant === 'line' ? (
    <ProjectLine project={project} hidden={hidden} />
  ) : (
    <ProjectCard project={project} filter={filter} hidden={hidden} />
  )
}

// Whether a project carries a tag, among its topics or its languages.
export function carries(project: Project, tag: string) {
  return (
    project.topics.includes(tag) ||
    project.technologies.includes(tag) ||
    project.category.split(' / ').includes(tag)
  )
}

function ProjectLine({
  project,
  hidden
}: {
  project: Project
  hidden: boolean
}) {
  return (
    <li
      hidden={hidden}
      className="grid gap-x-6 gap-y-1 border-b border-line py-4 text-sm text-muted md:grid-cols-[minmax(12rem,0.4fr)_1fr_auto] md:items-baseline"
    >
      <a className="link font-medium" href={project.url}>
        {project.title}
      </a>
      <span>{project.description}</span>
      <span className="mono">{project.year}</span>
    </li>
  )
}

// The `project-*` classes are hooks for print.css only.
function ProjectCard({
  project,
  filter,
  hidden
}: {
  project: Project
  filter?: Filter
  hidden: boolean
}) {
  const titleId = `${project.id}-title`
  return (
    <Entry
      className="project-row"
      id={`project-${project.id}`}
      titleId={titleId}
      layout="tile"
      hidden={hidden}
    >
      <EntryMeta kind={project.category} date={project.year} />
      <EntryTitle id={titleId}>{project.title}</EntryTitle>
      <EntryFigure className="project-cover">
        <ProjectCover project={project} />
      </EntryFigure>
      {project.metric && (
        <EntryMetric
          value={project.metric.value}
          label={project.metric.short}
        />
      )}
      <EntryBody>
        <EntrySummary className="project-description">
          {project.description}
        </EntrySummary>
        <EntryTags
          label={copy.lists.technologies}
          items={project.technologies}
          selected={filter?.tag}
          onSelect={filter?.choose}
        />
        <ProjectSignals project={project} />
        <EntryActions>
          {project.links?.map((link) => (
            <ResourceLink
              key={link.href}
              href={link.href}
              context={project.title}
            >
              {link.label}
            </ResourceLink>
          ))}
          <ResourceLink
            href={project.url}
            icon={GitHub}
            context={project.title}
          >
            {copy.actions.github}
          </ResourceLink>
        </EntryActions>
      </EntryBody>
    </Entry>
  )
}
