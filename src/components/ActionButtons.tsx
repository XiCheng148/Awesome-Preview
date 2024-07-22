import { Signal } from '@preact/signals'
import { useState } from 'preact/hooks'
import { motion, Variants } from 'framer-motion'
import {
  IoIosExpand,
  IoMdClose,
  IoIosOpen,
  IoMdLink,
  IoMdCheckmark
} from 'react-icons/io'
import { CgSpinnerAlt } from 'react-icons/cg'

type Props = {
  iframeRef: React.RefObject<HTMLIFrameElement>
  url: Signal<string | null>
  handleClose: () => void
}

const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.1, transition: { duration: 0.2 } }
}

const iconVariants: Variants = {
  idle: { rotate: 135, scale: 1 },
  loading: { rotate: 0, scale: 1 },
  success: {
    rotate: 0,
    scale: [1.2, 1],
    transition: { scale: { duration: 0.2 } }
  }
}

export default function ActionButtons({ iframeRef, url, handleClose }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'loading' | 'success'>('idle')

  const getOpenUrl = (openUrl: string | undefined) => {
    return openUrl && openUrl !== 'about:blank' ? openUrl : url.value
  }

  const handleOpenInMainFrame = (event: MouseEvent) => {
    event.stopPropagation()
    const iframeDocument = iframeRef.current?.contentDocument
    const openUrl = getOpenUrl(iframeDocument?.location.href)
    if (openUrl) {
      window.location.href = openUrl
    }
  }

  const handleOpenInNewTab = (event: MouseEvent) => {
    event.stopPropagation()
    const iframeDocument = iframeRef.current?.contentDocument
    const openUrl = getOpenUrl(iframeDocument?.location.href)
    openUrl && window.open(openUrl, '_blank')
  }

  const handleCopyLink = (event: MouseEvent) => {
    event.stopPropagation()
    const iframeDocument = iframeRef.current?.contentDocument
    const openUrl = getOpenUrl(iframeDocument?.location.href)
    if (openUrl) {
      setCopyState('loading')
      navigator.clipboard
        .writeText(openUrl)
        .then(() => {
          setCopyState('success')
          setTimeout(() => setCopyState('idle'), 1000)
        })
        .catch(() => {
          setCopyState('idle')
        })
    }
  }

  return (
    <div className="absolute top-0 -right-12 flex flex-col justify-start gap-3">
      <ActionButton onClick={handleClose} icon={<IoMdClose size={22} />} />
      <ActionButton onClick={handleOpenInMainFrame} icon={<IoIosExpand size={20} />} className="rotate-[270deg]" />
      <ActionButton onClick={handleOpenInNewTab} icon={<IoIosOpen size={20} />} />
      <ActionButton
        onClick={handleCopyLink}
        disabled={copyState === 'loading'}
        icon={
          copyState === 'loading' ? (
            <CgSpinnerAlt size={20} className="animate-spin" />
          ) : copyState === 'success' ? (
            <IoMdCheckmark size={20} />
          ) : (
            <IoMdLink size={20} />
          )
        }
        variants={iconVariants}
        animate={copyState}
      />
    </div>
  )
}

type ActionButtonProps = {
  onClick: (event: MouseEvent) => void
  icon: React.ReactNode
  disabled?: boolean
  className?: string
  variants?: Variants
  animate?: string
}

function ActionButton({ onClick, icon, disabled, className, variants, animate }: ActionButtonProps) {
  return (
    <motion.div
      className="backdrop-blur-md bg-white/60 dark:bg-black/60 rounded-full p-1 shadow-lg"
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
    >
      <motion.button
        className={`p-1 rounded transition-colors text-zinc-900 dark:text-white ${className}`}
        onClick={onClick}
        disabled={disabled}
        variants={variants}
        animate={animate}
      >
        {icon}
      </motion.button>
    </motion.div>
  )
}
