import { projectClaims } from '@/content/cv'
import { projectLinks } from '@/content/project-links'
import { sources } from '@/content/sources'
import { repositoryMedia } from '@/media/bindings'
import { snapshot } from './snapshot'

// Four places key something to a repository's full name: the list of sources,
// the picture bound to it, the claim the CV makes about it, and the records
// its module links to. A rename on GitHub breaks all four at once, and breaks
// them quietly — the page keeps rendering, only without the cover, the links
// and the card's place near the top. So the keys are checked against the
// snapshot, which is the one copy that comes from the API.
const known = new Set(snapshot.repositories.map((repo) => repo.fullName))

const keys = [
  ['sources', [...sources.repositories]],
  ['media/bindings', Object.keys(repositoryMedia)],
  ['content/cv', Object.keys(projectClaims)],
  ['content/project-links', Object.keys(projectLinks)]
] as const

test.each(keys)('%s names repositories the snapshot has', (_, list) =>
  expect(list.filter((fullName) => !known.has(fullName))).toEqual([])
)
