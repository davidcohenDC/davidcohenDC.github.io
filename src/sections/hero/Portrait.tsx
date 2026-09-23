import { copy } from '@/content/copy'

// David, drawn twice: greeting the day, at his desk by night.
//
// A background image rather than an <img>, for the same reason as before:
// only the drawing the current theme asks for is ever fetched. Each file is a
// traced outline with that theme's colours already in it, so it is sharp at
// any size and costs the script nothing — inlining them put the drawings in
// the bundle as well as in the page and went 13 KB over the JavaScript
// budget. See scripts/portrait.py.
export default function Portrait() {
  return (
    <div
      className="portrait-figure"
      role="img"
      aria-label={copy.labels.portrait}
    />
  )
}
