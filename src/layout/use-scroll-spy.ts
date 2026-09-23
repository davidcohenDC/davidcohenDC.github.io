import { useEffect, type RefObject } from 'react'
import { spy } from './scroll-spy'

// The portfolio's handle on scroll-spy.ts.
export default function useScrollSpy(nav: RefObject<HTMLElement | null>) {
  useEffect(() => (nav.current ? spy(nav.current) : undefined), [nav])
}
