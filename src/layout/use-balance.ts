import { useEffect, useRef } from 'react'
import onFrame, { motionAllowed } from '@/motion/raf'

const GRAVITY = 9
const STIFFNESS = 22
const DAMPING = 3.4
const LIMIT = 0.16
const AT_REST = 0.0008
const SCROLL_IMPULSE = 0.0022
const MAX_IMPULSE = 0.9

// The wordmark is an inverted pendulum: a scroll tips it, a damped controller
// brings it back, and the loop unsubscribes once it is still.
export default function useBalance() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node || !motionAllowed()) return
    let angle = 0
    let rate = 0
    let previous = window.scrollY
    let release: (() => void) | null = null

    function settle() {
      release?.()
      release = null
    }

    function frame(delta: number) {
      if (!delta) return
      const acceleration =
        GRAVITY * Math.sin(angle) - STIFFNESS * angle - DAMPING * rate
      rate += acceleration * delta
      angle = Math.min(Math.max(angle + rate * delta, -LIMIT), LIMIT)
      if (Math.abs(angle) < AT_REST && Math.abs(rate) < AT_REST * 5) {
        node!.style.transform = ''
        settle()
        return
      }
      node!.style.transform = `rotate(${angle.toFixed(4)}rad)`
    }

    const scrolled = () => {
      const y = window.scrollY
      const impulse = (y - previous) * SCROLL_IMPULSE
      rate += Math.min(Math.max(impulse, -MAX_IMPULSE), MAX_IMPULSE)
      previous = y
      if (!release) release = onFrame(frame)
    }
    window.addEventListener('scroll', scrolled, { passive: true })
    return () => {
      window.removeEventListener('scroll', scrolled)
      settle()
    }
  }, [])
  return ref
}
