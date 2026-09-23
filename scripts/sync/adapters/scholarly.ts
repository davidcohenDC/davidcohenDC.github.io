import type { PaperSource } from '../ports'
import type { Http } from './http'

// Crossref's work types, in the words the page uses.
const KINDS: Record<string, string> = {
  'journal-article': 'Peer-reviewed publication',
  'proceedings-article': 'Conference paper',
  'posted-content': 'Preprint',
  'book-chapter': 'Book chapter'
}

// What fits where the page shows the abstract.
const ABSTRACT_SENTENCES = 2

type CrossrefWork = {
  message?: {
    title?: string[]
    'container-title'?: string[]
    volume?: string
    'article-number'?: string
    page?: string
    published?: { 'date-parts'?: number[][] }
    author?: { given?: string; family?: string }[]
    type?: string
    'is-referenced-by-count'?: number
  }
}

type OpenAlexWork = {
  abstract_inverted_index?: Record<string, number[]>
  open_access?: { is_oa?: boolean }
  best_oa_location?: { license?: string | null }
}

// OpenAlex stores an abstract as word → positions; put the words back.
function rebuildAbstract(index: Record<string, number[]>) {
  return Object.entries(index)
    .flatMap(([word, positions]) =>
      positions.map((position) => [position, word] as const)
    )
    .sort((a, b) => a[0] - b[0])
    .map(([, word]) => word)
    .join(' ')
    .split(/(?<=\.)\s+/)
    .slice(0, ABSTRACT_SENTENCES)
    .join(' ')
}

// Crossref is the publisher's own deposit; OpenAlex adds what Crossref does
// not carry for this paper: the abstract and the open-access status.
export function createScholarlySource({
  http,
  userAgent
}: {
  http: Http
  userAgent: string
}): PaperSource {
  const init = {
    headers: { 'User-Agent': userAgent, Accept: 'application/json' }
  }

  return {
    async paper(doi) {
      const crossref = await http.json<CrossrefWork>(
        'crossref',
        `https://api.crossref.org/works/${doi}`,
        { init }
      )
      const record = crossref?.message
      if (!record?.title?.[0]) return null

      const alex = await http.json<OpenAlexWork>(
        'openalex',
        `https://api.openalex.org/works/doi:${doi}`,
        { init }
      )
      const index = alex?.abstract_inverted_index

      return {
        doi,
        title: record.title[0],
        kind: KINDS[record.type ?? ''] ?? 'Publication',
        journal: record['container-title']?.[0] ?? '',
        volume: record.volume ?? null,
        article: record['article-number'] ?? record.page ?? null,
        year: String(record.published?.['date-parts']?.[0]?.[0] ?? ''),
        authors: (record.author ?? []).map((author) =>
          `${author.given ?? ''} ${author.family ?? ''}`.trim()
        ),
        abstract: index ? rebuildAbstract(index) : null,
        openAccess: alex?.open_access?.is_oa ?? null,
        license: alex?.best_oa_location?.license ?? null,
        citations: record['is-referenced-by-count'] ?? null,
        sources: ['Crossref', 'OpenAlex']
      }
    }
  }
}
