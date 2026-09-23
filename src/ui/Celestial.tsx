// The sun and the moon on the theme dial, in three conditions: whole,
// cracked, and split. Every press switches the theme and does a little more
// damage, and the third press puts it back together — which is the joke, and
// also the only ending that does not leave a visitor stuck with a ruin.
//
// Solid shapes rather than outlines: a filled disc with short round rays and
// a filled crescent read as one mark at 20px, where hairline outlines with a
// break drawn in them read as a broken icon. The damage is cut into the fill
// in the colour of the page, so it looks carved rather than drawn on.
export type Damage = 0 | 1 | 2

// Eight short rays round the disc, a little way off it.
const rays =
  'M12 2.4v1.8M12 19.8v1.8M2.4 12h1.8M19.8 12h1.8' +
  'M5.2 5.2l1.3 1.3M17.5 17.5l1.3 1.3M5.2 18.8l1.3-1.3M17.5 6.5l1.3-1.3'

const crescent = 'M12 3a6.5 6.5 0 0 0 9 9 9 9 0 1 1-9-9Z'

// Where each body breaks: the same angle and kink for both, sized to fit.
const cracks = {
  sun: 'M10.8 8.4 12.4 11l-1.3 1.2 1.6 2.5',
  moon: 'M7.6 8.2 9.8 11.2 8 12.7l2.1 3.4'
}

export default function Celestial({
  body,
  damage
}: {
  body: 'sun' | 'moon'
  damage: Damage
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {body === 'sun' ? (
        <>
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path
            d={rays}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <path d={crescent} fill="currentColor" />
      )}
      {damage > 0 && (
        <path
          d={cracks[body]}
          fill="none"
          stroke="var(--color-bg)"
          strokeWidth={damage === 1 ? 1.2 : 2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
