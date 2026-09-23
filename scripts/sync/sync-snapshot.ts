import type { Package, Paper, Repository, Snapshot } from '@/domain/snapshot'
import type {
  PackageSource,
  PaperFacts,
  PaperSource,
  RepositorySource
} from './ports'

type Dependencies = {
  repositories: RepositorySource
  papers: PaperSource
  packages: PackageSource
  previous: Snapshot | null
  today: () => string
}

type Request = {
  repositories: readonly string[]
  dois: readonly string[]
}

function mergePackage(fresh: Package | null, kept: Package | null) {
  if (!fresh) return kept
  return {
    ...fresh,
    downloadsLastMonth:
      fresh.downloadsLastMonth ?? kept?.downloadsLastMonth ?? null
  }
}

function mergePaper(fresh: PaperFacts | null, kept: Paper | null) {
  if (!fresh) return kept
  return {
    ...fresh,
    abstract: fresh.abstract ?? kept?.abstract ?? null,
    openAccess: Boolean(fresh.openAccess ?? kept?.openAccess),
    license: fresh.license ?? kept?.license ?? null,
    citations: fresh.citations ?? kept?.citations ?? null
  }
}

// Builds a new snapshot. Nothing here may fail the build: a source that does
// not answer leaves the previous value in place, because a figure from an
// hour ago is right and an empty page because a third party was down is not.
export function createSyncSnapshot({
  repositories,
  papers,
  packages,
  previous,
  today
}: Dependencies) {
  const keptRepository = new Map(
    previous?.repositories.map((repo) => [repo.fullName, repo])
  )
  const keptPaper = new Map(previous?.papers.map((paper) => [paper.doi, paper]))

  // `listed` is the name in sources.ts; `facts.fullName` is what the
  // repository is called now. They differ after a rename, which GitHub
  // answers with a redirect: every field arrives as usual, and the only thing
  // that breaks is a comparison against a name the API no longer uses. The
  // pinned set is exactly that comparison, so it is made against the name the
  // API gave back, and the snapshot records that name too.
  async function repository(
    listed: string,
    pinned: Set<string> | null
  ): Promise<Repository | null> {
    const facts = await repositories.repository(listed)
    const kept =
      keptRepository.get(listed) ??
      (facts ? keptRepository.get(facts.fullName) : undefined)
    const displayName =
      (await repositories.readmeTitle(listed)) ?? kept?.displayName ?? null
    if (!facts) return kept ? { ...kept, displayName } : null
    const fullName = facts.fullName

    const [languages, release, commit, checks, published] = await Promise.all([
      repositories.languages(fullName),
      repositories.latestRelease(fullName),
      repositories.lastCommit(fullName),
      repositories.lastChecks(fullName),
      packages.packageOf(facts.name, facts.url)
    ])
    return {
      displayName,
      ...facts,
      pinned: pinned?.has(fullName) ?? false,
      languages: languages ?? kept?.languages ?? [],
      release: release ?? kept?.release ?? null,
      commit: commit ?? kept?.commit ?? null,
      checks: checks ?? kept?.checks ?? null,
      published: mergePackage(published, kept?.published ?? null)
    }
  }

  return async function syncSnapshot(request: Request): Promise<Snapshot> {
    const pinned = await repositories.pinned()

    const synced: Repository[] = []
    for (const fullName of request.repositories) {
      const repo = await repository(fullName, pinned)
      if (repo) synced.push(repo)
    }

    const read: Paper[] = []
    for (const doi of request.dois) {
      const paper = mergePaper(
        await papers.paper(doi),
        keptPaper.get(doi) ?? null
      )
      if (paper) read.push(paper)
    }

    return { fetched: today(), repositories: synced, papers: read }
  }
}
