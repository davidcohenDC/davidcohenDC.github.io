import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { renderToString } from 'react-dom/server'
import App from '@/app/App'
import { profile } from '@/content/profile'
import { documentPaths, metadata, renderNotFound, renderPage } from './pages'

const PAGES = ['/', ...documentPaths]

const publish = process.argv.includes('--production')
const robots = publish ? 'index, follow' : 'noindex, nofollow'

function prerenderPortfolio() {
  const template = readFileSync('build/index.html', 'utf8')
  return template
    .replace(
      '<div id="root"></div>',
      `<div id="root">${renderToString(<App />)}</div>`
    )
    .replace('content="noindex, nofollow"', `content="${robots}"`)
    .replace(
      '</head>',
      metadata('/', 'David Cohen — Software & Research') + '</head>'
    )
}

// The stylesheet Vite just hashed: the 404 wears the site's CSS without
// loading the application, which has nothing to do on it.
function builtStylesheet(template: string) {
  const match = /<link rel="stylesheet"[^>]*href="([^"]+)"/.exec(template)
  if (!match) throw new Error('No stylesheet in build/index.html')
  return match[1]
}

// Every local file the pages point at has to be in the build.
//
// A `poster` that 404s is a silent failure: the video shows a blank frame,
// the browser downloads the server's fallback page in place of a picture, and
// nothing in the console says so. It happened here the day the posters moved
// to a width one of the pictures had never been rendered at. A build that
// names a file it did not make is wrong, so it stops here.
function checkReferences() {
  const missing = new Set<string>()
  for (const name of readdirSync('build')) {
    if (!name.endsWith('.html')) continue
    const html = readFileSync(`build/${name}`, 'utf8')
    for (const [, path] of html.matchAll(
      /(?:src|href|poster)="(\/[^"]+\.(?:webp|png|jpe?g|svg|mp4|pdf|woff2|css|js|txt))"/g
    ))
      if (!existsSync(`build${path}`)) missing.add(`${name} -> ${path}`)
  }
  if (missing.size)
    throw new Error(
      `The build points at files it did not make:\n  ${[...missing].join('\n  ')}`
    )
}

function robotsTxt() {
  return publish
    ? `User-agent: *\nAllow: /\nSitemap: ${profile.origin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n'
}

function sitemap() {
  const urls = PAGES.map(
    (path) => `<url><loc>${profile.origin}${path}</loc></url>`
  ).join('')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
}

// The documents' script, by the hashed name Vite gave it.
function builtDocumentScript() {
  const manifest = JSON.parse(
    readFileSync('build/.vite/manifest.json', 'utf8')
  ) as Record<string, { file: string }>
  const entry = manifest['src/documents/client.ts']
  if (!entry) throw new Error('No documents script in the Vite manifest')
  return `/${entry.file}`
}

const template = readFileSync('build/index.html', 'utf8')
const skin = {
  stylesheet: builtStylesheet(template),
  script: builtDocumentScript()
}

writeFileSync('build/index.html', prerenderPortfolio())
writeFileSync('build/404.html', renderNotFound(skin.stylesheet))
for (const path of documentPaths)
  writeFileSync(`build${path}`, renderPage(path, publish, skin))
checkReferences()
writeFileSync('build/robots.txt', robotsTxt())
writeFileSync('build/sitemap.xml', sitemap())
console.log(
  `Static pages and metadata generated (${publish ? 'production' : 'local preview: noindex'}).`
)
