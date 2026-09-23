// One requestAnimationFrame loop for the whole page. It stops when nothing is
// subscribed or the tab is hidden, and hands out a delta in seconds so the
// physics is the same at 60 and 120 Hz.
type Frame = (delta: number) => void

// A restored tab must not integrate one enormous step.
const MAX_DELTA = 1 / 30

const frames = new Set<Frame>()
let handle = 0
let previous = 0
let listening = false

function tick(now: number) {
  handle = requestAnimationFrame(tick)
  const delta = previous ? Math.min((now - previous) / 1000, MAX_DELTA) : 0
  previous = now
  for (const frame of frames) frame(delta)
}

function start() {
  if (handle || !frames.size || document.hidden) return
  previous = 0
  handle = requestAnimationFrame(tick)
}

function stop() {
  cancelAnimationFrame(handle)
  handle = 0
}

export default function onFrame(frame: Frame) {
  frames.add(frame)
  if (!listening) {
    listening = true
    document.addEventListener('visibilitychange', () =>
      document.hidden ? stop() : start()
    )
  }
  start()
  return () => {
    frames.delete(frame)
    if (!frames.size) stop()
  }
}

// Motion is an enhancement everywhere: nothing it does is needed to read.
export function motionAllowed() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
