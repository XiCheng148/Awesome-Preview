import { Signal } from '@preact/signals'
import { IoIosExpand, IoMdClose, IoMdOpen } from 'react-icons/io'
import { CgSpinnerAlt } from 'react-icons/cg'
import { useCallback, useRef } from 'preact/hooks'
import useOnClickOutside from '../hooks/use-onclickoutside'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import Toaster from '../components/Toaster'
import Draggable from 'react-draggable'

type Props = {
  open: Signal<boolean>
  url: Signal<string | null>
  title: Signal<string | null>
  loading: Signal<boolean>
}

const variants: Variants = {
  open: {
    opacity: 1,
    height: '100%',
    width: '100%',
    x: 0,
    y: 0,
    transition: { duration: 0.1 },
  },
  closed: {
    opacity: 0,
    height: '50%',
    width: '50%',
    x: '25%',
    y: '25%',
    transition: { duration: 0.1 },
  },
}

export default function App({ open, url, title, loading }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

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

  return (
    <div
      className={open.value ? 'fixed inset-0 backdrop-blur-xl' : ''}
      // style={{
      //   'background-image': 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
      // }}
    >
      <AnimatePresence>
        {open.value && url.value && (
          <Draggable handle="[data-drag-region]" cancel="button">
            <div className="fixed z-[2147483646] flex h-full right-20 left-20 lg:right-48 lg:left-48 xl:right-64 xl:left-64 rounded-b-xl overflow-hidden shadow-2xl">
              <motion.div
                className="shadow-xl relative"
                ref={containerRef}
                animate="open"
                exit="closed"
                variants={variants}
                initial="closed"
              >
                <div
                  data-drag-region
                  className="grid h-10 grid-cols-6 items-center gap-4 rounded-t-xl bg-zinc-200 px-4 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <div className="col-span-4 col-start-2 inline-flex items-center justify-center gap-2">
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
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleOpenInNewTab}
                      className="header-icon-btn"
                    >
                      <IoMdOpen size={20} />
                    </button>
                    <button
                      className="header-icon-btn rotate-[270deg]"
                      onClick={handleOpenInMainFrame}
                    >
                      <IoIosExpand size={20} />
                    </button>
                    <button className="header-icon-btn" onClick={handleClose}>
                      <IoMdClose size={20} />
                    </button>
                  </div>
                </div>
                <div className="draggable-iframe-cover" />
                <iframe
                  ref={iframeRef}
                  src={url.value}
                  onLoad={handleOnLoad}
                  className="h-[calc(100%-40px)] w-full select-none border-none bg-zinc-50"
                />
              </motion.div>
            </div>
          </Draggable>
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  )
}
