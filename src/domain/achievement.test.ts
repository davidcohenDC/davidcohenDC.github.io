import type { Paper } from './snapshot'
import { bibtex } from './achievement'

const paper: Paper = {
  doi: '10.1000/x',
  title: 'Abstractive summarization, revisited',
  kind: 'Peer-reviewed publication',
  journal: 'Neural Networks',
  volume: '196',
  article: '108249',
  year: '2026',
  authors: ['Giacomo Frisoni', 'David Cohen'],
  abstract: null,
  openAccess: true,
  license: null,
  citations: null,
  sources: []
}

test('a citation is keyed and named the way reference managers expect', () => {
  const entry = bibtex(paper)
  expect(entry).toMatch(/^@article\{frisoni2026abstractive,\n/)
  expect(entry).toContain('author = {Frisoni, Giacomo and Cohen, David}')
  expect(entry).toContain('doi = {10.1000/x}')
})

test('a field the record does not have is left out, not left empty', () => {
  expect(bibtex({ ...paper, volume: null })).not.toContain('volume')
})
