import { sitePages } from '../src/content/site-pages'
import { pageScript } from './inline-scripts'

// What every page carries in its <head>, from this one file: the portfolio
// through vite.config.ts, the documents through scripts/pages.tsx. Two parts.
//
// 1. Speculation rules. Every page is small — the portfolio, the CV and a
//    case study are 5 to 9 KB of HTML each, over one shared stylesheet — so a
//    visitor should never wait for one. The other pages are prefetched at
//    once (about 20 KB), and the page behind a link the pointer rests on is
//    prerendered, so following it is a swap rather than a load. Chromium
//    reads the rules; elsewhere a line falls back to `<link rel="prefetch">`.
//
// 2. The behaviour of the site's own elements, which has to work on the
//    hydrated portfolio and on the static documents alike, and so is not
//    React's (src/layout/page.ts, compiled inline):
//    - a link to the page the visitor has just come from goes back instead
//      of loading it again: the browser shows it from its back-forward cache
//      at once, scrolled to where it was left;
//    - a floating group (`data-floating`, ui/Floating.tsx) arrives past the
//      first screen and leaves near the top;
//    - the way back to the top (`data-scroll-progress`) is told how much of
//      the page is behind, as `--progress` from 0 to 1, for its ring.
//
// Everything is same-origin and inline: no request, REQ-PRIV-1 untouched.

const rules = {
  prefetch: [{ urls: sitePages, eagerness: 'eager' }],
  prerender: [
    {
      source: 'document',
      where: {
        and: [
          { href_matches: '/*' },
          { not: { href_matches: '/*.pdf' } },
          { not: { selector_matches: '[download]' } }
        ]
      },
      eagerness: 'moderate'
    }
  ]
}

export function pageScripts() {
  return (
    `<script type="speculationrules">${JSON.stringify(rules)}</script>` +
    pageScript()
  )
}
