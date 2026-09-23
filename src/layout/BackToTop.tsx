import { copy } from '@/content/copy'
import { Floating, ScrollTop } from '@/ui/Floating'

// The portfolio's corner: the way back to the top, and nothing else. Its
// arrival and its ring are the element's own (ui/Floating.tsx).
export default function BackToTop() {
  return (
    <Floating>
      <ScrollTop label={copy.actions.backToTop} />
    </Floating>
  )
}
