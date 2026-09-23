import { useEffect, type RefObject } from 'react'
import { copy } from '@/content/copy'
import { motionAllowed } from '@/motion/raf'

type Connection = { saveData?: boolean; effectiveType?: string }

// Most-visible fraction a clip needs before it starts.
const PLAY_THRESHOLD = 0.55

// And how long it has to stay that way. Scrolling from one end of the page to
// the other drags every clip through the threshold on the way, and a clip
// that was crossed is not a clip that was reached: without this, passing one
// at speed was enough to start fetching it.
const SETTLE = 220

function wantsLessData() {
  const connection = (navigator as Navigator & { connection?: Connection })
    .connection
  return (
    connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType ?? '')
  )
}

// Clips behave like animated pictures: the one most in view plays, muted and
// looping, and the others pause. Nothing is fetched before a clip is reached,
// and nothing plays with reduced motion or a metered connection. A click or
// Enter on a clip stops it, and so does scrolling past it: nothing moves that
// a visitor cannot stop (WCAG 2.2.2).
//
// Nothing starts before the page has been scrolled, either. A clip that is
// already on the first screen has not been reached, it has been landed on —
// the same reason the first screen does not animate — and starting it costs
// the visitor the whole file before they have decided to stay: when a change
// of typeface shortened the page, the first clip came inside the threshold at
// load and put 176 KB on a page that otherwise weighs 240.
export default function useClips(region: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = region.current
    if (!root || !window.IntersectionObserver) return

    const clips = [...root.querySelectorAll<HTMLVideoElement>('video')]
    if (!clips.length) return
    if (!motionAllowed() || wantsLessData()) return playByHand(clips)

    // The bar of native controls comes off here rather than in the markup:
    // without JavaScript nothing plays by itself, so the bar is the only way
    // to see the clip at all and it stays. Once this hook is running, the
    // page plays and pauses the clips as they are reached, and the bar is a
    // piece of browser furniture sitting on a card — grey, in its own idiom,
    // and in the way of the picture it covers. What it offered is still
    // there: a click, or Enter, stops the clip; scrolling past it stops it
    // too.
    for (const clip of clips) {
      clip.loop = true
      clip.controls = false
      clip.tabIndex = 0
      clip.setAttribute(
        'aria-label',
        `${clip.getAttribute('aria-label')}, ${copy.labels.toPause}`
      )
    }

    let playing: HTMLVideoElement | null = null
    // A clip the visitor stopped by hand. It stays stopped until it leaves
    // the screen: being scrolled back past is a decision, staying where you
    // are is not.
    const stopped = new WeakSet<HTMLVideoElement>()
    let arrived = window.scrollY > 0
    // Stopping a clip by hand asks for stillness, not for the next clip: with
    // two cards on the screen at once, the one below used to start the moment
    // the first was stopped. So nothing starts by itself while the clip that
    // was stopped is still in front of the reader.
    let held: HTMLVideoElement | null = null
    let pending: number | undefined
    const visibility = new Map<HTMLVideoElement, number>()

    function start(clip: HTMLVideoElement | null) {
      playing?.pause()
      playing = clip
      if (!playing) return
      playing.preload = 'auto'
      // A browser may refuse autoplay; the poster is still there.
      void playing.play().catch(() => {})
    }

    function toggle(clip: HTMLVideoElement) {
      if (clip.paused) {
        held = null
        stopped.delete(clip)
        delete clip.dataset.state
        start(clip)
        return
      }
      held = clip
      stopped.add(clip)
      // Stopped by hand, it says how to start it again (projects.css).
      clip.dataset.state = 'paused'
      clip.pause()
      if (playing === clip) playing = null
    }

    function update() {
      if (!arrived) return
      if (held && (visibility.get(held) ?? 0) >= PLAY_THRESHOLD) return
      held = null
      let next: HTMLVideoElement | null = null
      let most = PLAY_THRESHOLD
      for (const [clip, ratio] of visibility)
        if (ratio > most && !stopped.has(clip)) [next, most] = [clip, ratio]
      if (next === playing) return
      // The candidate has to hold still for a moment before it costs anyone
      // a download. Anything already playing stops now: what is off screen
      // should not keep moving while the page does.
      window.clearTimeout(pending)
      if (!next) {
        start(null)
        return
      }
      pending = window.setTimeout(() => start(next), SETTLE)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const clip = entry.target as HTMLVideoElement
          visibility.set(clip, entry.intersectionRatio)
          // Off the screen, a clip forgets it was stopped.
          if (entry.intersectionRatio < PLAY_THRESHOLD) {
            stopped.delete(clip)
            delete clip.dataset.state
          }
        }
        update()
      },
      { threshold: [0, 0.25, PLAY_THRESHOLD, 0.8, 1] }
    )
    for (const clip of clips) observer.observe(clip)

    const onScroll = () => {
      arrived = true
      update()
    }
    window.addEventListener('scroll', onScroll, { passive: true, once: true })

    const onClick = (event: Event) =>
      toggle(event.currentTarget as HTMLVideoElement)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      // Space scrolls the page unless it is told that it did something here.
      event.preventDefault()
      toggle(event.currentTarget as HTMLVideoElement)
    }
    for (const clip of clips) {
      clip.addEventListener('click', onClick)
      clip.addEventListener('keydown', onKeyDown)
    }

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(pending)
      for (const clip of clips) {
        clip.removeEventListener('click', onClick)
        clip.removeEventListener('keydown', onKeyDown)
        clip.controls = true
      }
      playing?.pause()
    }
  }, [region])
}

// With motion turned down, or on a metered connection, nothing plays by
// itself — but the grey bar of native controls on every card was the price of
// that, and it is the one piece of the browser's furniture the page otherwise
// takes off. Here the clip is still its own control: a play mark drawn over
// the poster (projects.css), a click or Enter to start it, the same to stop
// it. It plays once rather than looping, and starting one stops any other.
function playByHand(clips: readonly HTMLVideoElement[]) {
  const listeners = clips.map((clip) => {
    clip.controls = false
    clip.tabIndex = 0
    clip.dataset.state = 'paused'
    clip.setAttribute(
      'aria-label',
      `${clip.getAttribute('aria-label')}, ${copy.labels.toPlayOrPause}`
    )
    const toggle = () => {
      if (!clip.paused) return clip.pause()
      for (const other of clips) if (other !== clip) other.pause()
      clip.preload = 'auto'
      void clip.play().catch(() => {})
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      toggle()
    }
    const onPlay = () => delete clip.dataset.state
    const onPause = () => (clip.dataset.state = 'paused')
    clip.addEventListener('click', toggle)
    clip.addEventListener('keydown', onKeyDown)
    clip.addEventListener('play', onPlay)
    clip.addEventListener('pause', onPause)
    return () => {
      clip.removeEventListener('click', toggle)
      clip.removeEventListener('keydown', onKeyDown)
      clip.removeEventListener('play', onPlay)
      clip.removeEventListener('pause', onPause)
      clip.pause()
      delete clip.dataset.state
      clip.controls = true
    }
  })
  return () => listeners.forEach((release) => release())
}
