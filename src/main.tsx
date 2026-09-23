import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from '@/app/App'

const container = document.getElementById('root')
if (!container) throw new Error('Missing application root')

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The build prerenders the page; the dev server serves an empty root.
if (container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
