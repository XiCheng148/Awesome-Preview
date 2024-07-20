import { Signal } from '@preact/signals'
import {
  IoIosExpand,
  IoMdClose,
  IoIosOpen,
  IoMdLink,
  IoMdCheckmark
} from 'react-icons/io'
import { CgSpinnerAlt } from 'react-icons/cg'
import { useCallback, useRef, useState } from 'preact/hooks'
import useOnClickOutside from '../hooks/use-onclickoutside'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import Draggable from 'react-draggable'

type Props = {
  open: Signal<boolean>
  url: Signal<string | null>
  title: Signal<string | null>
  loading: Signal<boolean>
  origin: Signal<{ x: number; y: number }>
}

const variants: Variants = {
  open: {
    opacity: 1,
    scale: 1,
    width: '100%',
    height: '100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.5
    }
  },
  closed: {
    opacity: 0,
    scale: 0.1,
    width: '100%',
    height: '100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 35,
      duration: 0.5
    }
  },
  buttonVariants: {
    idle: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } }
  },
  iconVariants: {
    idle: { rotate: 135, scale: 1 },
    loading: { rotate: 0, scale: 1 },
    success: {
      rotate: 0,
      scale: [1.2, 1],
      transition: { scale: { duration: 0.2 } }
    }
  }
}
export default function App({ open, url, title, loading, origin }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const getSystemTheme = () => {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark'
    }
    return 'light'
  }

  function handleClose() {
    open.value = false
  }

  const getContainer = useCallback(() => containerRef.current, [])

  useOnClickOutside(getContainer, handleClose)

  function handleOnLoad() {
    loading.value = false
    const iframeTitle = iframeRef.current?.contentDocument?.title
    if (iframeTitle) {
      title.value = iframeTitle
    }
  }

  function getOpenUrl(openUrl: string | undefined) {
    return openUrl && openUrl !== 'about:blank' ? openUrl : url.value
  }

  function handleOpenInMainFrame(event: MouseEvent) {
    event.stopPropagation()

    const iframeDocument = iframeRef.current?.contentDocument
    const openUrl = getOpenUrl(iframeDocument?.location.href)
    if (openUrl) {
      window.location.href = openUrl
    }
  }

  function handleOpenInNewTab(event: MouseEvent) {
    event.stopPropagation()

    const iframeDocument = iframeRef.current?.contentDocument
    const openUrl = getOpenUrl(iframeDocument?.location.href)
    openUrl && window.open(openUrl, '_blank')
  }

  const [copyState, setCopyState] = useState<'idle' | 'loading' | 'success'>(
    'idle'
  )

  function handleCopyLink(event: MouseEvent) {
    event.stopPropagation()

    const iframeDocument = iframeRef.current?.contentDocument
    const openUrl = getOpenUrl(iframeDocument?.location.href)
    if (openUrl) {
      setCopyState('loading')
      navigator.clipboard
        .writeText(openUrl)
        .then(() => {
          setCopyState('success')
          setTimeout(() => setCopyState('idle'), 1000) // 2秒后回到初始状态
        })
        .catch(() => {
          setCopyState('idle') // 如果复制失败，回到初始状态
        })
    }
  }

  return (
    <AnimatePresence>
      {open.value && url.value && (
        <div
          className="fixed inset-0 backdrop-blur-xl z-[999999999999999999]"
          onWheel={(e) => e.preventDefault()}
        >
          <Draggable handle="[data-drag-region]" cancel="button">
            <div className="fixed z-[999999999999999999] flex h-full right-36 left-36 rounded-xl shadow-2xl">
              <motion.div
                className="shadow-xl relative flex"
                ref={containerRef}
                variants={variants}
                initial="closed"
                animate="open"
                exit="closed"
                style={{
                  originX: origin.value.x / window.innerWidth,
                  originY: origin.value.y / window.innerHeight
                }}
              >
                {/* Main Panel */}
                <div className="flex-grow">
                  <div
                    data-drag-region
                    className="flex-grow flex h-10 items-center justify-center gap-4 rounded-t-xl px-4 text-zinc-900 dark:text-white backdrop-blur-md light:bg-white/60 dark:bg-black/60"
                  >
                    {loading.value ? (
                      <i className="h-5 w-5 shrink-0 animate-spin">
                        <CgSpinnerAlt size={22} />
                      </i>
                    ) : (
                      <i className="h-5 w-5"></i>
                    )}
                    <span className="truncate text-sm select-none">
                      {title}
                    </span>
                  </div>
                  <div className="draggable-iframe-cover" />
                  <iframe
                    ref={iframeRef}
                    src={`${url.value}${
                      url.value.includes('?') ? '&' : '?'
                    }theme=${getSystemTheme()}`}
                    onLoad={handleOnLoad}
                    className="h-[calc(100%-40px)] w-full select-none border-none bg-zinc-50 rounded-b-xl"
                  />
                </div>

                {/* Side Panel for Buttons */}
                <div className="absolute top-0 -right-14 flex flex-col justify-start pt-2 gap-3">
                  <motion.div
                    className="backdrop-blur-md bg-white/60 dark:bg-black/60 rounded-full p-2 shadow-lg dark:shadow-zinc-800 light:shadow-zinc-900"
                    variants={variants.buttonVariants}
                    initial="idle"
                    whileHover="hover"
                  >
                    <motion.button
                      className="p-1 rounded transition-colors"
                      onClick={handleClose}
                    >
                      <IoMdClose
                        size={22}
                        className="dark:text-white text-zinc-900"
                      />
                    </motion.button>
                  </motion.div>
                  <motion.div
                    className="backdrop-blur-md bg-white/60 dark:bg-black/60 rounded-full p-2 shadow-lg dark:shadow-zinc-800 light:shadow-zinc-900"
                    variants={variants.buttonVariants}
                    initial="idle"
                    whileHover="hover"
                  >
                    <motion.button
                      className="p-1 rounded transition-colors rotate-[270deg]"
                      onClick={handleOpenInMainFrame}
                    >
                      <IoIosExpand
                        size={20}
                        className="dark:text-white text-zinc-900"
                      />
                    </motion.button>
                  </motion.div>
                  <motion.div
                    className="backdrop-blur-md bg-white/60 dark:bg-black/60 rounded-full p-2 shadow-lg dark:shadow-zinc-800 light:shadow-zinc-900"
                    variants={variants.buttonVariants}
                    initial="idle"
                    whileHover="hover"
                  >
                    <motion.button
                      onClick={handleOpenInNewTab}
                      className="p-1 rounded transition-colors"
                    >
                      <IoIosOpen
                        size={20}
                        className="dark:text-white text-zinc-900"
                      />
                    </motion.button>
                  </motion.div>
                  <motion.div
                    className="backdrop-blur-md bg-white/60 dark:bg-black/60 rounded-full p-2 shadow-lg dark:shadow-zinc-800 light:shadow-zinc-900"
                    variants={variants.buttonVariants}
                    initial="idle"
                    whileHover="hover"
                  >
                    <motion.button
                      className="p-1 rounded transition-colors transform transition-all"
                      onClick={handleCopyLink}
                      disabled={copyState === 'loading'}
                    >
                      <motion.div
                        variants={variants.iconVariants}
                        animate={copyState}
                        initial="idle"
                      >
                        {copyState === 'loading' ? (
                          <CgSpinnerAlt
                            size={20}
                            className="dark:text-white text-zinc-900 animate-spin"
                          />
                        ) : copyState === 'success' ? (
                          <IoMdCheckmark
                            size={20}
                            className="dark:text-white text-zinc-900"
                          />
                        ) : (
                          <IoMdLink
                            size={20}
                            className="dark:text-white text-zinc-900"
                          />
                        )}
                      </motion.div>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </Draggable>
        </div>
      )}
    </AnimatePresence>
  )
}
