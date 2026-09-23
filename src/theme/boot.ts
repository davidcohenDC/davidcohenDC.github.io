import { apply, follow, wantsDark } from './theme'

// Before the first paint: the theme the visitor chose, or their system's,
// on <html>, so nothing is ever drawn in the other one first. Compiled to a
// small inline script (scripts/inline-scripts.ts) and placed in every page's
// <head>; it keeps following the system, other tabs and a prerendered
// page's activation for pages that have no other script to do it.
apply(wantsDark())
follow(() => apply(wantsDark()))
