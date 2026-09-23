import { useEffect, type RefObject } from 'react'
import { motionAllowed } from './raf'

// A light that follows the pointer across an element: the pointer's position
// inside it, as `--light-x` and `--light-y`, and `data-lit` while the pointer
// is over it. What the light does is the stylesheet's business (hero.css
// lights the grid under it); this only says where it is.
//
// Written at most once a frame, on the element itself, and never where
// there is no pointer to follow or motion is turned down.
export default function usePointerLight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = ref.current
    if (!node || !motionAllowed()) return
    if (!window.matchMedia('(hover: hover)').matches) return

    let frame = 0
    let x = 0
    let y = 0
    const place = () => {
      frame = 0
      node.style.setProperty('--light-x', `${x}px`)
      node.style.setProperty('--light-y', `${y}px`)
    }
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect()
      x = event.clientX - box.left
      y = event.clientY - box.top
      if (!frame) frame = requestAnimationFrame(place)
    }
    const enter = () => (node.dataset.lit = 'true')
    const leave = () => delete node.dataset.lit

    node.addEventListener('pointermove', move, { passive: true })
    node.addEventListener('pointerenter', enter)
    node.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerenter', enter)
      node.removeEventListener('pointerleave', leave)
      delete node.dataset.lit
    }
  }, [ref])
}
