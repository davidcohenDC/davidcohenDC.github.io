import { metrics } from '@/content/metrics'
import { projectLinks } from '@/content/project-links'
import { sources } from '@/content/sources'
import { pinnedFirst, toProject, type Project } from '@/domain/project'
import { repositoryMedia } from '@/media/bindings'
import { snapshot } from './snapshot'

const { repositories } = snapshot

// Every repository through the same mapping; the list decides only how many
// get a full card.
const all: readonly Project[] = pinnedFirst(repositories).map((repo) =>
  toProject(repo, {
    ...repositoryMedia[repo.fullName],
    links: projectLinks[repo.fullName],
    metric: metrics[repo.fullName]
  })
)

// A card is a picture and a figure, so a repository earns one by having
// them: among those, pins and then the configured order decide. The rest
// are a line each until a picture is bound (media/bindings.ts). Pinned
// alone was not enough — the pins put two coverless repositories on cards
// and kept the one on PyPI in the fold.
const pictured = all.filter((project) => project.cover)

export const projects = pictured.slice(0, sources.featured)

export const moreProjects = all.filter((project) => !projects.includes(project))
