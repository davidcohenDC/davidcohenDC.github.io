import type { RepositorySource } from '../ports'
import type { Http } from './http'

const API = 'https://api.github.com'
const RAW = 'https://raw.githubusercontent.com'
const MAX_LANGUAGES = 4
const MAX_TITLE = 60
const MAX_SUBJECT = 120
const PINNED_LIMIT = 6

type RepoResponse = {
  full_name: string
  name: string
  html_url: string
  description: string | null
  topics?: string[]
  homepage: string | null
  stargazers_count: number
  forks_count: number
  license: { spdx_id: string } | null
  created_at: string
  pushed_at: string
}

type PinnedResponse = {
  data?: { user?: { pinnedItems?: { nodes?: { nameWithOwner: string }[] } } }
}

const day = (timestamp: string) => timestamp.slice(0, 10)

// "# [Scala Robotics Simulator](…) ![badge](…)" → "Scala Robotics Simulator"
function headingOf(readme: string) {
  const heading = readme.match(/^#\s+(.+)$/m)?.[1]
  if (!heading) return null
  return (
    heading
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[#*_`]/g, '')
      .trim()
      .slice(0, MAX_TITLE) || null
  )
}

export function createGitHubSource({
  http,
  owner,
  userAgent,
  token
}: {
  http: Http
  owner: string
  userAgent: string
  token?: string
}): RepositorySource {
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const api = <T>(label: string, path: string, missingIsOk = false) =>
    http.json<T>(label, `${API}${path}`, { init: { headers }, missingIsOk })

  return {
    // Pinned items exist only in GraphQL, which needs a token.
    async pinned() {
      if (!token) return null
      const body = await http.json<PinnedResponse>('pinned', `${API}/graphql`, {
        init: {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `{ user(login: "${owner}") { pinnedItems(first: ${PINNED_LIMIT}, types: REPOSITORY) {
        nodes { ... on Repository { nameWithOwner } } } } }`
          })
        }
      })
      const nodes = body?.data?.user?.pinnedItems?.nodes
      return nodes ? new Set(nodes.map((node) => node.nameWithOwner)) : null
    },

    async repository(fullName) {
      const repo = await api<RepoResponse>(fullName, `/repos/${fullName}`)
      if (!repo) return null
      return {
        fullName: repo.full_name,
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        topics: repo.topics ?? [],
        homepage: repo.homepage || null,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        createdYear: repo.created_at.slice(0, 4),
        // NOASSERTION means GitHub could not tell, which is not a licence.
        license:
          repo.license && repo.license.spdx_id !== 'NOASSERTION'
            ? repo.license.spdx_id
            : null,
        pushedAt: day(repo.pushed_at)
      }
    },

    // From the raw file host: no token, and no share of the API rate limit.
    async readmeTitle(fullName) {
      const readme = await http.text(
        `${fullName} readme`,
        `${RAW}/${fullName}/HEAD/README.md`,
        { init: { headers: { 'User-Agent': userAgent } }, missingIsOk: true }
      )
      return readme ? headingOf(readme) : null
    },

    async languages(fullName) {
      const bytes = await api<Record<string, number>>(
        `${fullName} languages`,
        `/repos/${fullName}/languages`
      )
      if (!bytes) return null
      return Object.entries(bytes)
        .sort((a, b) => b[1] - a[1])
        .map(([language]) => language)
        .slice(0, MAX_LANGUAGES)
    },

    async latestRelease(fullName) {
      const release = await api<{ tag_name: string; published_at: string }>(
        `${fullName} release`,
        `/repos/${fullName}/releases/latest`,
        true
      )
      if (!release?.tag_name) return null
      return { tag: release.tag_name, published: day(release.published_at) }
    },

    async lastCommit(fullName) {
      const commits = await api<
        { commit: { author: { date: string }; message: string } }[]
      >(`${fullName} commit`, `/repos/${fullName}/commits?per_page=1`)
      const commit = commits?.[0]?.commit
      if (!commit) return null
      return {
        date: day(commit.author.date),
        subject: commit.message.split('\n')[0].slice(0, MAX_SUBJECT)
      }
    },

    async lastChecks(fullName) {
      const runs = await api<{
        workflow_runs: {
          name: string
          conclusion: string
          updated_at: string
        }[]
      }>(
        `${fullName} checks`,
        `/repos/${fullName}/actions/runs?per_page=1&status=completed&branch=main`
      )
      const run = runs?.workflow_runs?.[0]
      if (!run) return null
      return {
        conclusion: run.conclusion,
        workflow: run.name,
        at: day(run.updated_at)
      }
    }
  }
}
