import { buildSync } from 'esbuild'

// The scripts every page runs before anything else, compiled from TypeScript
// into inline <script>s: each entry is bundled with what it imports, so what
// they share with the rest of the site (the theme's storage key, the list of
// pages) exists once, in the source, and cannot fall out of step with it.
// Built once per process; the dev server and the page export both call these.
const built = new Map<string, string>()

function inline(entry: string) {
  if (!built.has(entry))
    built.set(
      entry,
      buildSync({
        entryPoints: [entry],
        bundle: true,
        format: 'iife',
        minify: true,
        write: false,
        target: 'es2022',
        alias: { '@': './src' }
      }).outputFiles[0].text.trim()
    )
  return `<script>${built.get(entry)}</script>`
}

// The theme, before the first paint (src/theme/boot.ts).
export const bootScript = () => inline('src/theme/boot.ts')

// What every page does: prefetching, going back, the corner controls
// (src/layout/page-entry.ts).
export const pageScript = () => inline('src/layout/page-entry.ts')
