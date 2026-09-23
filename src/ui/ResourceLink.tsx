import type { ElementType, ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

type Props = {
  href: string
  children: ReactNode
  icon?: ElementType
  context?: string
  className?: string
  // For a file the browser should save rather than open in a tab.
  download?: boolean
}

// A native link with a trailing glyph for its destination: ↗ leaves the
// site, → stays on it. `context` completes the accessible name.
export default function ResourceLink({
  href,
  children,
  icon: Icon,
  context,
  className = 'text-link',
  download = false
}: Props) {
  const external = /^https?:/.test(href)
  const Arrow =
    external || href.startsWith('mailto:') ? ArrowUpRight : ArrowRight
  return (
    <a className={className} href={href} download={download || undefined}>
      {Icon && <Icon size={20} aria-hidden="true" focusable="false" />}
      <span>
        {children}
        {context && <span className="sr-only">, {context}</span>}
        {external && <span className="sr-only">, external site</span>}
      </span>
      <Arrow size={20} aria-hidden="true" focusable="false" />
    </a>
  )
}
