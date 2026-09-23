import type {
  Checks,
  Commit,
  Package,
  Paper,
  Release,
  Snapshot
} from '@/domain/snapshot'

// What the sync needs from the outside world. Every method answers `null`
// when a source is down or has nothing to say; deciding what to keep instead
// is the use case's job, not the adapter's.

export type RepositoryFacts = {
  // What the repository is called now. A rename is answered by a redirect,
  // so every other field arrives as if nothing had happened and only this
  // says otherwise.
  fullName: string
  name: string
  url: string
  description: string | null
  topics: string[]
  homepage: string | null
  stars: number
  forks: number
  createdYear: string
  license: string | null
  pushedAt: string
}

export interface RepositorySource {
  pinned(): Promise<Set<string> | null>
  repository(fullName: string): Promise<RepositoryFacts | null>
  readmeTitle(fullName: string): Promise<string | null>
  languages(fullName: string): Promise<string[] | null>
  latestRelease(fullName: string): Promise<Release | null>
  lastCommit(fullName: string): Promise<Commit | null>
  lastChecks(fullName: string): Promise<Checks | null>
}

// Fields a secondary index may not know are null.
export type PaperFacts = Omit<
  Paper,
  'abstract' | 'openAccess' | 'license' | 'citations'
> & {
  abstract: string | null
  openAccess: boolean | null
  license: string | null
  citations: number | null
}

export interface PaperSource {
  paper(doi: string): Promise<PaperFacts | null>
}

export interface PackageSource {
  // The package named like the repository, only if it points back to it.
  packageOf(name: string, repositoryUrl: string): Promise<Package | null>
}

export interface SnapshotStore {
  read(): Snapshot | null
  write(snapshot: Snapshot): void
}
