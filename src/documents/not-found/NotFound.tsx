import { profile } from '@/content/profile'
import { copy } from '@/content/copy'
import { documentCopy } from '@/content/document-copy'

// What GitHub Pages serves for an address that does not exist. It is a page of
// this site rather than a stranger's: same tokens, same theme, same two ways
// out. It loads the stylesheet and the theme script and nothing else — there
// is nothing here to hydrate.
export default function NotFound() {
  return (
    <main className="shell flex min-h-dvh flex-col justify-center py-16">
      <p className="eyebrow text-muted">{documentCopy.notFound.code}</p>
      <h1 className="display mt-2 mb-4 text-display">
        {documentCopy.notFound.title}
      </h1>
      <p className="max-w-measure text-base text-muted">
        {documentCopy.notFound.text}
      </p>
      <nav className="mt-8 flex flex-wrap items-center gap-4">
        <a className="button primary" href="/">
          {documentCopy.actions.portfolio}
        </a>
        <a className="button secondary" href="/cv.html">
          {copy.actions.cv}
        </a>
      </nav>
      <p className="mono mt-10 text-muted">{profile.origin}</p>
    </main>
  )
}
