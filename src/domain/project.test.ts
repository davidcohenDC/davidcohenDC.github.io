import type { Repository } from './snapshot'
import { NO_DESCRIPTION, pinnedFirst, toProject } from './project'

const repo: Repository = {
  fullName: 'me/pps-22-srs',
  displayName: null,
  name: 'pps-22-srs',
  url: 'https://github.com/me/pps-22-srs',
  description: null,
  topics: ['robotics', 'scala', 'rl', 'simulation'],
  homepage: null,
  stars: 4,
  forks: 0,
  createdYear: '2025',
  license: null,
  pushedAt: '2026-09-20',
  pinned: true,
  languages: ['Scala'],
  release: null,
  commit: { date: '2026-09-20', subject: 'feat' },
  checks: null,
  published: null
}

test('a repository with no details still becomes a readable project', () => {
  const project = toProject(repo)
  expect(project).toMatchObject({
    id: 'pps-22-srs',
    title: 'pps 22 srs',
    category: 'robotics / scala',
    technologies: ['rl', 'simulation'],
    description: NO_DESCRIPTION,
    year: '2025–2026'
  })
})

test('without topics the languages name the kind, and the tags skip the first', () => {
  const plain = { ...repo, topics: [], languages: ['Python', 'Shell'] }
  expect(toProject(plain)).toMatchObject({
    category: 'Python / Shell',
    technologies: ['Shell']
  })
})

test('the README title wins over the repository name', () => {
  expect(toProject({ ...repo, displayName: 'SRS' }).title).toBe('SRS')
})

test('pinned repositories come first, the configured order stands otherwise', () => {
  const a = { ...repo, url: 'a', pinned: false }
  const b = { ...repo, url: 'b', pinned: true }
  const c = { ...repo, url: 'c', pinned: false }
  expect(pinnedFirst([a, b, c]).map((r) => r.url)).toEqual(['b', 'a', 'c'])
})
