import { useEffect, type RefObject } from 'react'
import { ask } from './asking'

// The portfolio's handle on asking.ts.
export default function useAsking(button: RefObject<HTMLElement | null>) {
  useEffect(() => (button.current ? ask(button.current) : undefined), [button])
}
