import { useEffect } from 'preact/hooks'
import getEventTarget from '../common/utils'

type AnyEvent = MouseEvent | TouchEvent

export default function useOnClickOutside(
  getContainer: () => HTMLElement | null,
  handler: (event: AnyEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const container = getContainer()
      if (!container || container.contains(getEventTarget(event) as Node)) {
        return
      }
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [getContainer, handler])
}
