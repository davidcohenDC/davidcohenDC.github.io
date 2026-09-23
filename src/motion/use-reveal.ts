import { useEffect } from 'react'
import { motionAllowed } from './raf'

// Sections rise into view once as they are reached. Nothing is hidden while
// waiting: the stylesheet only names an animation, so without JavaScript or
// with reduced motion every element is simply there. What is on screen at
// load does not animate (it cost 95 ms of blocking time, and the visitor has
// not arrived there, they started there).
export default function useReveal() {
  useEffect(() => {
    if (!window.IntersectionObserver || !motionAllowed()) return
    let arrived = false
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (!isIntersecting) continue
          // The first callback describes the page as it loaded.
          if (arrived) target.classList.add('is-visible')
          observer.unobserve(target)
        }
        arrived = true
      },
      { threshold: 0.05, rootMargin: '0px 0px -8% 0px' }
    )
    document
      .querySelectorAll('[data-reveal], [data-reveal-group]')
      .forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}
