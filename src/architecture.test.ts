import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

// The dependency rule, enforced. Each layer may import itself and the layers
// listed here; anything else fails the build. See README → Architecture.
const ALLOWED: Record<string, readonly string[]> = {
  domain: ['media'],
  media: [],
  content: ['domain', 'media'],
  data: ['domain', 'content', 'media'],
  ui: [],
  motion: [],
  // The theme's reveal is a movement: it asks motion whether it may move.
  theme: ['motion'],
  layout: ['ui', 'data', 'content', 'motion'],
  sections: ['ui', 'data', 'content', 'domain', 'media', 'motion'],
  // The documents' script runs the same plain-DOM behaviour the portfolio's
  // hooks wrap: the menu, the theme control, the theme itself.
  documents: [
    'ui',
    'data',
    'content',
    'domain',
    'media',
    'layout',
    'theme',
    'motion'
  ],
  app: ['layout', 'sections', 'motion', 'theme', 'styles']
}

const SRC = resolve('src')
const SYNC = resolve('scripts/sync')

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return files(path)
    return /\.tsx?$/.test(entry.name) ? [path] : []
  })
}

function imports(file: string) {
  const source = readFileSync(file, 'utf8')
  return [...source.matchAll(/^import[^'"]*['"]([^'"]+)['"]/gm)].map(
    (match) => match[1]
  )
}

// '@/ui/Entry' → 'ui'; './x' resolved against the file; packages → null.
function layerOf(specifier: string, from: string) {
  let path: string
  if (specifier.startsWith('@/')) path = join(SRC, specifier.slice(2))
  else if (specifier.startsWith('.')) path = resolve(dirname(from), specifier)
  else return null
  const inside = relative(SRC, path)
  return inside.startsWith('..') ? 'outside' : inside.split(sep)[0]
}

function violations(file: string, allowed: readonly string[], own?: string) {
  return imports(file)
    .map((specifier) => ({ specifier, layer: layerOf(specifier, file) }))
    .filter(({ layer }) => layer && layer !== own && !allowed.includes(layer))
    .map(({ specifier }) => `${relative('.', file)} → ${specifier}`)
}

test('REQ-ARCH-1 each layer of the site imports only the layers below it', () => {
  const broken = files(SRC)
    .filter((file) => !file.endsWith('.test.ts') && !file.endsWith('.test.tsx'))
    .flatMap((file) => {
      const layer = relative(SRC, file).split(sep)[0]
      const allowed = ALLOWED[layer]
      return allowed ? violations(file, allowed, layer) : []
    })
  expect(broken).toEqual([])
})

test('REQ-ARCH-1 the sync depends on the snapshot contract and the source list only', () => {
  const broken = files(SYNC).flatMap((file) =>
    violations(file, ['domain', 'content', 'outside'])
  )
  expect(broken).toEqual([])
})
