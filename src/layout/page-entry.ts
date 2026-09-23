import { sitePages } from '@/content/site-pages'
import { cornerControls, goBackToWhereYouCame, prefetchWithout } from './page'

// Past the first screen this far before the corner controls arrive.
const SHOW_AFTER = 600

prefetchWithout(sitePages)
goBackToWhereYouCame()
cornerControls(SHOW_AFTER)
