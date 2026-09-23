import Celestial, { type Damage } from './Celestial'

// The face of the theme control: a horizon across the disc, and a
// wheel turning under the horizon with the sun on one side and the moon on
// the other. The theme turns the wheel (toggle.css), so pressing the control
// is a sunset or a sunrise, and the same markup serves the portfolio, where
// React re-renders it, and the static documents, where only the attribute
// on <html> changes.
//
// Both bodies take the same damage: whichever one comes up next shows what
// the last press did.
export default function ThemeDial({ damage = 0 }: { damage?: Damage }) {
  return (
    <span className="dial" aria-hidden="true">
      <span className="dial-wheel">
        {/* Keyed by its condition so the hit animation replays on each press. */}
        <span className="dial-body dial-sun">
          <Celestial key={damage} body="sun" damage={damage} />
        </span>
        <span className="dial-body dial-moon">
          <Celestial key={damage} body="moon" damage={damage} />
        </span>
      </span>
      <span className="dial-ground" />
    </span>
  )
}
