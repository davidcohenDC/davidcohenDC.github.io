// Four hand-drawn marks in the icon library's style: importing them cost
// ~900 B gzip of critical JavaScript, these cost a tenth of that.
const glyphs = {
  tag: 'M3 4h8l9 9-7 7-9-9z M7.5 8.5h.01',
  check: 'm5 13 4.5 4.5L19 8',
  cross: 'M6.5 6.5l11 11 m0-11-11 11',
  box: 'M21 8.5v7l-9 5-9-5v-7l9-5z M3.2 8.4 12 13.5l8.8-5.1 M12 13.5V20'
} as const

export type GlyphName = keyof typeof glyphs

export default function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={glyphs[name]} />
    </svg>
  )
}
