import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { profile } from '@/content/profile'
import { papers } from '@/data/achievements'
import type { Paper } from '@/domain/snapshot'
import NotFound from '@/documents/not-found/NotFound'
import Resume from '@/documents/cv/Resume'
import { bootScript } from './inline-scripts'
import { pageScripts } from './page-scripts'

const PERSON_ID = `${profile.origin}/#person`
const person = { '@type': 'Person', '@id': PERSON_ID, name: profile.name }

function profileSchema(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: profile.name,
      description: profile.description,
      url: profile.origin,
      email: `mailto:${profile.email}`,
      jobTitle: profile.jobTitle,
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: profile.university.name,
        url: profile.university.url
      },
      knowsAbout: profile.interests,
      sameAs: [profile.github, profile.linkedin]
    }
  }
}

// Its own node, so search engines can link the author to the article.
function paperSchema(paper: Paper) {
  const url = `https://doi.org/${paper.doi}`
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: paper.title,
    url,
    sameAs: url,
    datePublished: paper.year,
    isPartOf: {
      '@type': 'Periodical',
      name: paper.journal,
      volumeNumber: paper.volume
    },
    author: paper.authors.map((name) =>
      name === profile.name ? person : { '@type': 'Person', name }
    )
  }
}

// Escaped so no string in the data can close the script element.
const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c')

export function metadata(
  path: string,
  title: string,
  description = profile.description
) {
  const url = profile.origin + path
  const schemas = [profileSchema(url), ...papers.map(paperSchema)]
  return renderToStaticMarkup(
    <>
      <link rel="canonical" href={url} />
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta
        property="og:image"
        content={profile.origin + '/social-preview.jpg'}
      />
      <meta property="og:image:alt" content="Portrait of David Cohen" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      {schemas.map((data) => {
        const json = jsonLd(data)
        // Keyed by what it contains: these are rendered once, to a string, and
        // a schema's own type is what distinguishes one from the next.
        return (
          <script
            key={json.slice(0, 64)}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
          />
        )
      })}
    </>
  )
}

type Document = {
  path: string
  title: string
  description: string
  content: ReactNode
}

// What a document needs from the build: the stylesheet Vite hashed and the
// documents' own script (src/documents/client.ts) under its hashed name. The
// theme is set before the first paint by the inline boot script, which every
// page carries (scripts/inline-scripts.ts).
export type Skin = { stylesheet: string; script: string }

// What the dev server wants: Vite serves both from source, unhashed.
//
// It is also the default, because the one caller that can pass the wrong
// arguments is the dev server — it loads this module through
// `ssrLoadModule`, which is untyped, so a change of signature here is not a
// compile error there. A default turns that from a blank page into nothing
// at all.
export const DEV_SKIN: Skin = {
  stylesheet: '/src/styles/index.css',
  script: '/src/documents/client.ts'
}

function renderDocument(
  document: Document,
  publish: boolean,
  skin: Skin = DEV_SKIN
) {
  const { path, title, description, content } = document
  const html = renderToStaticMarkup(
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fdf6e3" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="robots"
          content={publish ? 'index, follow' : 'noindex, nofollow'}
        />
        {/* Every page wears the portfolio's stylesheet — same tokens, same
            sizes, both themes. */}
        <link rel="stylesheet" href={skin.stylesheet} />
        <link
          rel="preload"
          href="/fonts/archivo-display.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <script type="module" src={skin.script} />
      </head>
      <body className="portfolio">{content}</body>
    </html>
  )
  return (
    '<!doctype html>' +
    html.replace(
      '</head>',
      bootScript() +
        metadata(path, title, description) +
        pageScripts() +
        '</head>'
    )
  )
}

const CV_PATH = '/cv.html'

function documentFor(path: string): Document | null {
  if (path !== CV_PATH) return null
  return {
    path,
    title: 'David Cohen — CV',
    description: profile.description,
    content: <Resume />
  }
}

export const documentPaths = [CV_PATH]

export function renderPage(
  path: string,
  publish = false,
  skin: Skin = DEV_SKIN
) {
  const document = documentFor(path)
  if (!document) throw new Error(`No static document at ${path}`)
  return renderDocument(document, publish, skin)
}

// The page GitHub Pages serves for an address that does not exist. It is not
// in the sitemap and it says so in its own head: a 404 that asks to be indexed
// is a 404 that turns up in search results.
export function renderNotFound(stylesheet: string) {
  const html = renderToStaticMarkup(
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fdf6e3" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>{`Page not found — ${profile.name}`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href={stylesheet} />
      </head>
      <body>
        <NotFound />
      </body>
    </html>
  )
  return '<!doctype html>' + html.replace('</head>', bootScript() + '</head>')
}
