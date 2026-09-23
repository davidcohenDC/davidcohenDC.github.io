import type { Paper, Repository, Snapshot } from '@/domain/snapshot'
import type { PaperSource, RepositoryFacts, RepositorySource } from './ports'
import { createSyncSnapshot } from './sync-snapshot'

const facts: RepositoryFacts = {
  fullName: 'me/tool',
  name: 'tool',
  url: 'https://github.com/me/tool',
  description: 'A tool.',
  topics: ['cli'],
  homepage: null,
  stars: 3,
  forks: 0,
  createdYear: '2025',
  license: 'MIT',
  pushedAt: '2026-09-20'
}

const kept: Repository = {
  displayName: 'Tool',
  ...facts,
  description: 'Yesterday.',
  pinned: false,
  languages: ['Python'],
  release: { tag: 'v1.0.0', published: '2026-01-01' },
  commit: { date: '2026-09-01', subject: 'fix' },
  checks: { conclusion: 'success', workflow: 'CI', at: '2026-09-01' },
  published: {
    name: 'tool',
    version: '1.0.0',
    uploaded: '2026-01-01',
    requiresPython: null,
    downloadsLastMonth: 42
  }
}

const paper: Paper = {
  doi: '10/x',
  title: 'A paper',
  kind: 'Preprint',
  journal: 'J',
  volume: null,
  article: null,
  year: '2026',
  authors: ['Ada Lovelace'],
  abstract: 'Kept.',
  openAccess: true,
  license: 'cc-by',
  citations: 5,
  sources: ['Crossref', 'OpenAlex']
}

const previous: Snapshot = {
  fetched: '2026-09-01',
  repositories: [kept],
  papers: [paper]
}

const silent: RepositorySource = {
  pinned: async () => null,
  repository: async () => null,
  readmeTitle: async () => null,
  languages: async () => null,
  latestRelease: async () => null,
  lastCommit: async () => null,
  lastChecks: async () => null
}

const noPapers: PaperSource = { paper: async () => null }

function sync(repositories: RepositorySource, papers = noPapers) {
  return createSyncSnapshot({
    repositories,
    papers,
    packages: {
      packageOf: async () => ({ ...kept.published!, downloadsLastMonth: null })
    },
    previous,
    today: () => '2026-09-23'
  })({ repositories: ['me/tool', 'me/other'], dois: ['10/x'] })
}

test('a source that does not answer leaves the previous values in place', async () => {
  const snapshot = await sync(silent)
  expect(snapshot).toEqual({
    fetched: '2026-09-23',
    repositories: [kept],
    papers: [paper]
  })
})

test('fresh facts replace the old ones, and each missing field keeps its own', async () => {
  const snapshot = await sync(
    {
      ...silent,
      repository: async (name) => (name === 'me/other' ? null : facts),
      languages: async () => ['Rust']
    },
    {
      paper: async () => ({
        ...paper,
        abstract: null,
        license: null,
        citations: 6,
        openAccess: null
      })
    }
  )
  const [repo] = snapshot.repositories
  expect(repo.description).toBe('A tool.')
  expect(repo.languages).toEqual(['Rust'])
  expect(repo.release).toEqual(kept.release)
  expect(repo.published?.downloadsLastMonth).toBe(42)
  expect(snapshot.papers[0]).toMatchObject({
    abstract: 'Kept.',
    license: 'cc-by',
    citations: 6,
    openAccess: true
  })
})

test('only the repositories pinned on GitHub are marked pinned', async () => {
  const snapshot = await sync({
    ...silent,
    pinned: async () => new Set(['me/other']),
    repository: async (name) => ({ ...facts, fullName: name })
  })
  expect(snapshot.repositories.map((repo) => repo.pinned)).toEqual([
    false,
    true
  ])
})

// A renamed repository answers to its old name through a redirect, so every
// field arrives as usual and only the pinned set, which is a comparison of
// names, comes back wrong. It cost this page its first card once.
test('a renamed repository is still recognised as pinned', async () => {
  const snapshot = await sync({
    ...silent,
    pinned: async () => new Set(['me/tool-renamed']),
    repository: async (name) => ({
      ...facts,
      fullName: name === 'me/tool' ? 'me/tool-renamed' : name
    })
  })
  const [repo] = snapshot.repositories
  expect(repo.fullName).toBe('me/tool-renamed')
  expect(repo.pinned).toBe(true)
})
