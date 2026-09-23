import { useRef, useState } from 'react'
import { copy } from '@/content/copy'
import type { Damage } from '@/ui/Celestial'
import ThemeDial from '@/ui/ThemeDial'
import { centreOf, type Origin } from '@/motion/origin'
import useAsking from './use-asking'

type Props = { dark: boolean; onToggle: (from: Origin) => void }

// The sky turns over, and every press does a little more damage: whole,
// cracked, broken, whole again. It starts whole, which is also what the
// prerendered HTML holds, so there is nothing to reconcile on hydration.
//
// The press hands the page the control's centre, which is where the new
// theme spreads from (theme/use-theme.ts).
export default function ThemeToggle({ dark, onToggle }: Props) {
  const [damage, setDamage] = useState<Damage>(0)
  const button = useRef<HTMLButtonElement>(null)
  useAsking(button)
  return (
    <button
      ref={button}
      className="theme-toggle round-control relative size-11 shrink-0 cursor-pointer"
      type="button"
      onClick={(event) => {
        setDamage(((damage + 1) % 3) as Damage)
        onToggle(centreOf(event.currentTarget))
      }}
      aria-label={dark ? copy.actions.toLight : copy.actions.toDark}
    >
      <ThemeDial damage={damage} />
    </button>
  )
}
