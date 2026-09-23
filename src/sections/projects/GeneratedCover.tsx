import type { ElementType } from 'react'
import type { Project } from '@/domain/project'

// A repository with no picture still gets a cover, and it is drawn from what
// GitHub already says about it: the icon its topics choose, its full name, and
// a tint picked from that name so two coverless projects never look alike.
// Nothing here is written per project — adding one is still a line in
// content/sources.ts.

// The page's own roles, not new colours: a generated cover may not introduce a
// hue the rest of the site does not have.
const TINTS = ['--color-accent', '--color-signal', '--color-ink'] as const

// Deterministic, so a cover does not change between two builds of the same
// repository.
function tintOf(fullName: string) {
  let sum = 0
  for (const character of fullName) sum += character.codePointAt(0) ?? 0
  return TINTS[sum % TINTS.length]
}

// The icon arrives as a prop, the way EntryMeta takes it: chosen by the
// caller from the topics, never built here during a render.
export default function GeneratedCover({
  project,
  icon: Icon,
  className
}: {
  project: Project
  icon: ElementType
  className?: string
}) {
  const tint = `var(${tintOf(project.fullName)})`
  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${className ?? ''}`}
      aria-hidden="true"
    >
      {/* The ruled ground: the page's line colour, at the spacing step. */}
      <span
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(var(--color-line) 1px, transparent 1px)',
          backgroundSize: '12px 12px'
        }}
      />
      <Icon
        size={56}
        strokeWidth={1.25}
        style={{ color: tint, opacity: 0.55 }}
        aria-hidden="true"
        focusable="false"
      />
      <span
        className="mono absolute right-0 bottom-0 left-0 truncate px-3 pb-2 text-muted"
        style={{ borderTop: '1px solid var(--color-line)', paddingTop: '6px' }}
      >
        {project.fullName}
      </span>
    </div>
  )
}
