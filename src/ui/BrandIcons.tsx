import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement> & { size?: number }

// Monograms instead of brand logos: no trademark artwork is shipped.
function Monogram({ label, size = 24, ...props }: Props & { label: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="11"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
        fill="currentColor"
      >
        {label}
      </text>
    </svg>
  )
}

export function GitHub(props: Props) {
  return <Monogram label="gh" {...props} />
}

export function LinkedIn(props: Props) {
  return <Monogram label="in" {...props} />
}
