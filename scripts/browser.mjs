import { existsSync } from 'node:fs'
import { chromium } from '@playwright/test'

// The bundled Chromium when `npx playwright install chromium` has run (CI);
// otherwise the Chrome already installed on the machine, so local checks
// need no extra download.
export const browserChannel = existsSync(chromium.executablePath())
  ? undefined
  : 'chrome'
