// Composition root of the build-time sync: `npm run sync`.
//
// The site reads a committed snapshot and never calls an API itself, so a
// visitor never waits on one or meets a rate limit. Replacing a source (or
// adding a backend) means a new adapter here; the site does not move.
import type { Snapshot } from '@/domain/snapshot'
import { createGitHubSource } from './adapters/github'
import { createHttp } from './adapters/http'
import { createPypiSource } from './adapters/pypi'
import { createScholarlySource } from './adapters/scholarly'
import { createSnapshotFile } from './adapters/snapshot-file'
import { DOIS, OWNER, REPOSITORIES, SNAPSHOT_PATH, USER_AGENT } from './config'
import { createSyncSnapshot } from './sync-snapshot'

const http = createHttp()
const store = createSnapshotFile(SNAPSHOT_PATH)

const syncSnapshot = createSyncSnapshot({
  repositories: createGitHubSource({
    http,
    owner: OWNER,
    userAgent: USER_AGENT,
    token: process.env.GITHUB_TOKEN
  }),
  papers: createScholarlySource({ http, userAgent: USER_AGENT }),
  packages: createPypiSource({ http, userAgent: USER_AGENT }),
  previous: store.read(),
  today: () => new Date().toISOString().slice(0, 10)
})

const snapshot = await syncSnapshot({ repositories: REPOSITORIES, dois: DOIS })
store.write(snapshot)

function summary({ repositories, papers }: Snapshot) {
  const count = (has: (repo: Snapshot['repositories'][number]) => unknown) =>
    repositories.filter(has).length
  return (
    `Wrote ${repositories.length} repositories: ${count((r) => r.pinned)} pinned, ` +
    `${count((r) => r.release)} with a release, ${count((r) => r.checks)} with CI, ` +
    `${count((r) => r.published)} published to a registry. ` +
    `${papers.length} paper(s): ${papers.map((paper) => `${paper.citations ?? '?'} citations`).join(', ')}.`
  )
}

// A rename is the one thing the sources cannot smooth over: GitHub redirects
// the request, so the page still fills, but the name in sources.ts is now a
// name the API does not use — and every comparison against it silently
// fails, the pinned set first. It cost the top of the page once, without a
// word anywhere, so it gets one here.
const renamed = REPOSITORIES.filter(
  (listed) => !snapshot.repositories.some((repo) => repo.fullName === listed)
).map((listed) => {
  const listedNames: readonly string[] = REPOSITORIES
  const now = snapshot.repositories.find(
    (repo) => !listedNames.includes(repo.fullName)
  )
  return `${listed} -> ${now ? now.fullName : 'gone'}`
})

console.log(summary(snapshot))
if (renamed.length)
  console.warn(
    `Renamed on GitHub; update sources.ts, media/bindings.ts and content/cv.ts:\n  ${renamed.join('\n  ')}`
  )
if (http.failures.length)
  console.warn(
    `Kept the previous value for ${http.failures.length} field(s):\n  ${http.failures.join('\n  ')}`
  )
