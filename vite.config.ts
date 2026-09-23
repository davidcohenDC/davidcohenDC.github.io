import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { bootScript } from './scripts/inline-scripts'
import { pageScripts } from './scripts/page-scripts'

// In development the static documents are rendered on request, so they
// stay editable with hot reload like the rest of the site.
function staticDocuments(): Plugin {
  return {
    name: 'static-documents',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const route = request.url?.split('?')[0] ?? ''
        try {
          const { documentPaths, renderPage, DEV_SKIN } =
            await server.ssrLoadModule('/scripts/pages.tsx')
          if (!documentPaths.includes(route)) return next()
          response.setHeader('Content-Type', 'text/html; charset=utf-8')
          response.end(renderPage(route, false, DEV_SKIN))
        } catch (error) {
          next(error)
        }
      })
    }
  }
}

// The portfolio's <head> gets the same scripts as the documents, in
// development and in the build alike: the theme before the first paint
// (scripts/inline-scripts.ts) and what every page does (scripts/page-scripts.ts).
function headScripts(): Plugin {
  return {
    name: 'page-scripts',
    transformIndexHtml: (html) =>
      html.replace('</head>', `${bootScript()}${pageScripts()}</head>`)
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), staticDocuments(), headScripts()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  // Two entries: the portfolio, and the documents' own script. The manifest
  // is how the page export finds the second one's hashed name.
  build: {
    outDir: 'build',
    manifest: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        document: fileURLToPath(
          new URL('./src/documents/client.ts', import.meta.url)
        )
      }
    }
  },
  // Every unit test reads data or source files; none renders a page, so
  // there is no DOM to simulate.
  test: {
    environment: 'node',
    globals: true,
    include: ['{src,scripts}/**/*.test.{ts,tsx}']
  }
})
