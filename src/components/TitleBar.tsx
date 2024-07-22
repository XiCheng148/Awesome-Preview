import { Signal } from '@preact/signals'
import { CgSpinnerAlt } from 'react-icons/cg'

type Props = {
  title: Signal<string | null>
  loading: Signal<boolean>
}

export default function TitleBar({ title, loading }: Props) {
  return (
    <div
      className="flex h-10 items-center justify-center gap-4 rounded-t-xl px-4 text-zinc-900 dark:text-white backdrop-blur-md bg-white/60 dark:bg-black/60"
    >
      {loading.value ? (
        <i className="h-5 w-5 shrink-0 animate-spin">
          <CgSpinnerAlt size={22} />
        </i>
      ) : (
        <i className="h-5 w-5"></i>
      )}
      <span className="truncate text-sm select-none">{title}</span>
    </div>
  )
}
