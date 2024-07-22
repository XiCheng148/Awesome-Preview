import { Signal } from '@preact/signals'
import { AnimatePresence } from 'framer-motion'
import PreviewWindow from '../components/PreviewWindow'

type State = {
  open: Signal<boolean>
  url: Signal<string | null>
  title: Signal<string | null>
  loading: Signal<boolean>
  origin: Signal<{ x: number; y: number }>
}

export default function App(state: State) {
  return (
    <AnimatePresence>
      {state.open.value && state.url.value && (
        <div
          className="fixed inset-0 backdrop-blur-xl z-[999999999999999999]"
          onWheel={(e) => e.preventDefault()}
        >
          <PreviewWindow {...state} />
        </div>
      )}
    </AnimatePresence>
  )
}
