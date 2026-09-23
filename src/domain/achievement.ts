import type { ImageKey } from '@/media/images'
import type { Paper } from './snapshot'

// An achievement is a record somebody else holds. Everything it says comes
// from that record; nothing is written per paper.

export type Link = { href: string; label: string; context?: string }

export type Preview = {
  image: ImageKey
  caption: string
  license?: Link
  archive?: Link
}

export type Achievement = {
  id: string
  kind: string
  date: string
  title: string
  journal: string
  where: string
  summary: string
  facts: readonly string[]
  evidence: Link
  code?: Link
  authors: readonly string[]
  // The record as a BibTeX entry, for whoever wants to cite it.
  citation: string
  preview?: Preview
}

export type PaperAssets = {
  code?: string
  image?: ImageKey
  archive?: Link
}

const LICENSES: Record<string, Link> = {
  'cc-by': {
    label: 'CC BY 4.0',
    href: 'https://creativecommons.org/licenses/by/4.0/'
  },
  'cc-by-sa': {
    label: 'CC BY-SA 4.0',
    href: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  'cc-by-nc': {
    label: 'CC BY-NC 4.0',
    href: 'https://creativecommons.org/licenses/by-nc/4.0/'
  },
  'cc-by-nc-nd': {
    label: 'CC BY-NC-ND 4.0',
    href: 'https://creativecommons.org/licenses/by-nc-nd/4.0/'
  },
  cc0: {
    label: 'CC0',
    href: 'https://creativecommons.org/publicdomain/zero/1.0/'
  }
}

const familyName = (author: string) => author.split(' ').at(-1) ?? author

// "Giacomo Frisoni" → "G. Frisoni"
export function shortAuthor(author: string) {
  const parts = author.split(' ')
  if (parts.length < 2) return author
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`
}

export function paperWhere(paper: Paper) {
  return [
    paper.journal,
    paper.volume && `Volume ${paper.volume}`,
    paper.article,
    paper.openAccess && 'open access'
  ]
    .filter(Boolean)
    .join(' · ')
}

// "Giacomo Frisoni" → "Frisoni, Giacomo", the form BibTeX sorts by.
const bibtexName = (author: string) => {
  const parts = author.split(' ')
  return parts.length < 2
    ? author
    : `${parts.at(-1)}, ${parts.slice(0, -1).join(' ')}`
}

// The paper's record as BibTeX, keyed the way reference managers key it:
// first author's family name, year, first word of the title.
export function bibtex(paper: Paper) {
  const first = paper.authors[0] ? familyName(paper.authors[0]) : 'anon'
  const word = paper.title.split(/\W+/).find(Boolean) ?? ''
  const key = `${first}${paper.year}${word}`.toLowerCase().replace(/\W/g, '')
  const fields = [
    ['title', paper.title],
    ['author', paper.authors.map(bibtexName).join(' and ')],
    ['journal', paper.journal],
    ['volume', paper.volume],
    ['pages', paper.article],
    ['year', paper.year],
    ['doi', paper.doi]
  ].filter((field): field is [string, string] => Boolean(field[1]))
  return (
    `@article{${key},\n` +
    fields.map(([name, text]) => `  ${name} = {${text}}`).join(',\n') +
    '\n}'
  )
}

export function paperToAchievement(
  paper: Paper,
  assets: PaperAssets = {}
): Achievement {
  const license = paper.license ? LICENSES[paper.license] : undefined
  const firstAuthor = paper.authors[0]
  return {
    id: paper.doi.replace(/\W+/g, '-'),
    kind: paper.kind,
    date: paper.year,
    title: paper.title,
    journal: paper.journal,
    where: paperWhere(paper),
    summary: paper.abstract ?? '',
    // The authors are printed in full and open access is in `where`, so the
    // one fact left is the one somebody else counted.
    facts: [
      paper.citations !== null
        ? `Cited ${paper.citations} times · ${paper.sources[0]}`
        : ''
    ].filter(Boolean),
    evidence: {
      href: `https://doi.org/${paper.doi}`,
      label: 'Read the paper',
      context: paper.openAccess ? 'DOI, open access' : 'DOI'
    },
    code: assets.code
      ? { href: assets.code, label: 'Code & dataset', context: paper.title }
      : undefined,
    authors: paper.authors,
    citation: bibtex(paper),
    preview: assets.image
      ? {
          image: assets.image,
          caption: `First page · ${firstAuthor ? familyName(firstAuthor) : ''} et al.`,
          license,
          archive: assets.archive
        }
      : undefined
  }
}
