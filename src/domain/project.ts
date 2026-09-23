import type { Clip } from '@/media/bindings'
import type { ImageKey } from '@/media/images'
import type { Checks, Package, Release, Repository } from './snapshot'

// A project is a repository as GitHub describes it. Nothing here is written
// per project: add a repository to content/sources.ts and it renders.

export const NO_DESCRIPTION = 'No description on GitHub yet.'

// The figure a project is remembered by, and what it counts. It is David's
// own claim, signed in the CV (content/metrics.ts), and it is the one
// sentence about a project the page takes from anywhere but its record.
// `label` is the CV's full sentence; `short` is the card's, a few words
// with the details left to the CV.
export type Metric = { value: string; label: string; short: string }

// Where a project points besides its repository: a label and an address.
export type ProjectLink = { label: string; href: string }

export type ProjectAssets = {
  cover?: ImageKey
  clip?: Clip
  metric?: Metric
  links?: readonly ProjectLink[]
}

export type Project = ProjectAssets & {
  id: string
  fullName: string
  title: string
  category: string
  description: string
  topics: readonly string[]
  technologies: readonly string[]
  release: Release | null
  checks: Checks | null
  published: Package | null
  license: string | null
  stars: number
  updated: string
  url: string
  year: string
}

export function projectTitle(repo: Repository) {
  return repo.displayName ?? repo.name.replace(/[-_]/g, ' ')
}

// The first two topics, or the languages when there are no topics.
export function projectCategory(repo: Repository) {
  const words = repo.topics.length ? repo.topics : repo.languages
  return words.slice(0, 2).join(' / ')
}

// The words after the category, so the tags never repeat the line above them.
export function projectTechnologies(repo: Repository) {
  const topics = repo.topics.slice(2, 6)
  if (topics.length) return topics
  const languages = repo.languages.filter(
    (language) => !repo.topics.includes(language.toLowerCase())
  )
  return repo.topics.length ? languages : languages.slice(1)
}

export function projectYears(repo: Repository) {
  const first = repo.createdYear ?? repo.pushedAt.slice(0, 4)
  const last = repo.pushedAt.slice(0, 4)
  return first === last ? last : `${first}–${last}`
}

export function toProject(
  repo: Repository,
  assets: ProjectAssets = {}
): Project {
  return {
    ...assets,
    id: repo.name.toLowerCase(),
    fullName: repo.fullName,
    title: projectTitle(repo),
    category: projectCategory(repo),
    description: repo.description ?? NO_DESCRIPTION,
    topics: repo.topics,
    technologies: projectTechnologies(repo),
    release: repo.release,
    checks: repo.checks,
    published: repo.published,
    license: repo.license ?? null,
    stars: repo.stars,
    updated: repo.commit?.date ?? repo.pushedAt,
    url: repo.url,
    year: projectYears(repo)
  }
}

// Pinned repositories first; otherwise the configured order stands.
export function pinnedFirst(repositories: readonly Repository[]) {
  return [...repositories].sort((a, b) => Number(b.pinned) - Number(a.pinned))
}
