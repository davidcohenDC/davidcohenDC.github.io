// The contract between the build-time sync (scripts/sync) and the site: what
// the outside world said, dated. Written by the sync, read by src/data.

export type Release = { tag: string; published: string }

export type Commit = { date: string; subject: string }

export type Checks = { conclusion: string; workflow: string; at: string }

export type Package = {
  name: string
  version: string
  uploaded: string
  requiresPython: string | null
  downloadsLastMonth: number | null
}

export type Repository = {
  fullName: string
  // The first heading of the README, which is how a project names itself:
  // `scala-robotics-simulator` is "Scala Robotics Simulator".
  displayName: string | null
  name: string
  url: string
  description: string | null
  topics: readonly string[]
  homepage: string | null
  stars: number
  forks: number
  // Absent from records kept from syncs that predate the field.
  createdYear?: string
  // SPDX identifier (MIT, Apache-2.0).
  license: string | null
  pushedAt: string
  pinned: boolean
  // Most-used first, by bytes.
  languages: readonly string[]
  release: Release | null
  commit: Commit | null
  checks: Checks | null
  published: Package | null
}

export type Paper = {
  doi: string
  title: string
  kind: string
  journal: string
  volume: string | null
  article: string | null
  year: string
  authors: readonly string[]
  abstract: string | null
  openAccess: boolean
  // SPDX-like id from OpenAlex, e.g. "cc-by".
  license: string | null
  citations: number | null
  sources: readonly string[]
}

export type Snapshot = {
  fetched: string
  repositories: Repository[]
  papers: Paper[]
}
