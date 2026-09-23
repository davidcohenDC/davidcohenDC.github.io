import { useSyncExternalStore } from 'react'

// The tag the projects are filtered by, kept in the address (`?tag=robotics`)
// so a filtered view can be linked to and survives a reload. Replaced rather
// than pushed: a filter is a view of this page, not a step in the visitor's
// history, and the back button should still go where it went before.
//
// Read through useSyncExternalStore: the prerendered page has no address to
// read, so it renders unfiltered, and React moves to the address's filter
// straight after hydrating without a mismatch.
const PARAM = 'tag'
const EVENT = 'tagchange'

function subscribe(change: () => void) {
  window.addEventListener(EVENT, change)
  window.addEventListener('popstate', change)
  return () => {
    window.removeEventListener(EVENT, change)
    window.removeEventListener('popstate', change)
  }
}

function choose(next: string | null) {
  const url = new URL(window.location.href)
  if (next) url.searchParams.set(PARAM, next)
  else url.searchParams.delete(PARAM)
  window.history.replaceState(window.history.state, '', url)
  window.dispatchEvent(new Event(EVENT))
}

const current = () => new URLSearchParams(window.location.search).get(PARAM)
const none = () => null

export default function useTagFilter() {
  const tag = useSyncExternalStore(subscribe, current, none)

  return [tag, choose] as const
}
