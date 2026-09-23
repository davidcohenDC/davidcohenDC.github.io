import { Check, Copy } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import useCopy from './use-copy'
import useHydrated from './use-hydrated'

type Props = {
  value: string
  // What the button does, and what it says once it has done it.
  label: string
  done: string
  // A word beside the icon, for a button that is more than an icon.
  children?: ReactNode
  icon?: ElementType
}

// A button that copies a value and says so: the icon turns to a tick, a
// small note rises over the button with `done` in it, and a screen reader
// hears the same word. How the copying is done is clipboard.ts's business,
// and how long the moment lasts is use-copy.ts's; this is only how it looks.
//
// Without JavaScript it cannot do anything, so until the page is hydrated it
// holds its place invisibly — present, so nothing moves when it appears.
export default function CopyButton({
  value,
  label,
  done,
  children,
  icon: Icon = Copy
}: Props) {
  const ready = useHydrated()
  const { phase, copy } = useCopy()
  const copied = phase !== 'idle'

  return (
    <button
      type="button"
      className={`copy-button ${children ? 'has-label' : ''} ${ready ? '' : 'invisible'}`}
      aria-label={label}
      disabled={!ready}
      data-copied={copied || undefined}
      onClick={() => void copy(value)}
    >
      {copied ? (
        <Check size={16} aria-hidden="true" focusable="false" />
      ) : (
        <Icon size={16} aria-hidden="true" focusable="false" />
      )}
      {children && <span aria-hidden="true">{children}</span>}
      {/* The note is in the page only while it is read, so an invisible one
          can never stick out past a narrow screen. */}
      {copied && (
        <span className="copy-note" data-phase={phase} aria-hidden="true">
          {done}
        </span>
      )}
      <span className="sr-only" role="status">
        {copied ? done : ''}
      </span>
    </button>
  )
}
