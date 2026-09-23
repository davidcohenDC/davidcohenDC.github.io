import { useEffect, useState } from 'react'
import { copyText } from './clipboard'

// Copying, and the moment that follows it: `copy` puts a text on the
// clipboard and, if it got there, moves `phase` from idle to shown, then to
// leaving, then back to idle — long enough to be read, and a beat to fade.
// Any control that copies something takes its feedback from here, so the
// timing is one decision and not one per button.
export type CopyPhase = 'idle' | 'shown' | 'leaving'

const SHOWN_FOR = 1600
const LEAVING_FOR = 180

export default function useCopy() {
  const [phase, setPhase] = useState<CopyPhase>('idle')

  useEffect(() => {
    if (phase === 'idle') return
    const timer = window.setTimeout(
      () => setPhase(phase === 'shown' ? 'leaving' : 'idle'),
      phase === 'shown' ? SHOWN_FOR : LEAVING_FOR
    )
    return () => window.clearTimeout(timer)
  }, [phase])

  async function copy(text: string) {
    const ok = await copyText(text)
    if (ok) setPhase('shown')
    return ok
  }

  return { phase, copy }
}
