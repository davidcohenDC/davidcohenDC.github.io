import { defineConfig } from '@playwright/test'
import { browserChannel } from './scripts/browser.mjs'
export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: browserChannel,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure'
  },
  webServer: {
    command:
      'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false
  }
})
