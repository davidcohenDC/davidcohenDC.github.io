import { sources } from '@/content/sources'

// What to read comes from the same list the site renders (content/sources.ts).
export const OWNER = sources.owner
export const REPOSITORIES = sources.repositories
export const DOIS = sources.papers.map((paper) => paper.doi)

// Naming the project puts the requests in the public APIs' polite pools.
export const USER_AGENT = `david-cohen-portfolio (+https://github.com/${OWNER})`

export const SNAPSHOT_PATH = 'src/data/snapshot.json'
