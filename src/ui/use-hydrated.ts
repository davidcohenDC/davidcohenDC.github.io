import { useSyncExternalStore } from 'react'

// False in the prerendered HTML and while React hydrates it, true once the
// page is live. A control that needs JavaScript to do anything asks this
// before it offers itself — React's own way of telling the two apart,
// without a second render and without a mismatch.
const nothing = () => () => {}
const live = () => true
const prerendered = () => false

export default function useHydrated() {
  return useSyncExternalStore(nothing, live, prerendered)
}
