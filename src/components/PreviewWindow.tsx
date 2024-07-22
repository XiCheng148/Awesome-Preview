import { Signal } from '@preact/signals'
import { motion, Variants } from 'framer-motion'
import { useCallback, useRef, useEffect } from 'preact/hooks'
import useOnClickOutside from '../hooks/use-onclickoutside'
import TitleBar from './TitleBar'
import ActionButtons from './ActionButtons'

type Props = {
  open: Signal<boolean>
  url: Signal<string | null>
  title: Signal<string | null>
  loading: Signal<boolean>
  origin: Signal<{ x: number; y: number }>
}

const variants: Variants = {
  open: (custom) => ({
    opacity: 1,
    scale: 1,
    x: '-50%',
    y: '-50%',
    width: '90%',
    height: '98%',
    left: '50%',
    top: '50%',
    transition: {
      type: 'tween',
      stiffness: 300,
      duration: 0.3
    }
  }),
  closed: (custom) => ({
    opacity: 0,
    scale: 0.1,
    // x: custom.x,
    // y: custom.y,
    width: 0,
    height: 0,
    left: custom.x,
    top: custom.y,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 35,
      duration: 0.5
    }
  })
}

export default function PreviewWindow({ open, url, title, loading, origin }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const handleClose = () => {
    open.value = false
  }

  const getContainer = useCallback(() => containerRef.current, [])

  useOnClickOutside(getContainer, handleClose)

  const handleOnLoad = () => {
    loading.value = false
    const iframeTitle = iframeRef.current?.contentDocument?.title
    if (iframeTitle) {
      title.value = iframeTitle
    }
  }

  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      e.preventDefault()
    }

    if (open.value) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('wheel', preventScroll, { passive: false })
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('wheel', preventScroll)
    }
  }, [open.value])

  return (
      <motion.div
        className="fixed z-[999999999999999999] flex rounded-xl shadow-2xl bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-black/20"
        ref={containerRef}
        variants={variants}
        initial="closed"
        animate="open"
        exit="closed"
        custom={origin.value}
        style={{
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex-grow flex flex-col">
          <TitleBar title={title} loading={loading} />
          <iframe
            ref={iframeRef}
            src={`${url.value}${url.value?.includes('?') ? '&' : '?'}theme=${getSystemTheme()}`}
            onLoad={handleOnLoad}
            className="flex-grow w-full select-none border-none bg-zinc-50 rounded-b-xl"
          />
        </div>
        <ActionButtons iframeRef={iframeRef} url={url} handleClose={handleClose} />
      </motion.div>
  )
}

function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
