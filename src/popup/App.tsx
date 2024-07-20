import browser from 'webextension-polyfill'
import { useEffect, useState, useRef } from 'preact/hooks'
import { useSettings } from '../hooks/use-settings'
import * as utils from '../common/utils'
import { ISettings } from '../common/types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  Info,
  ChevronUp,
  ChevronDown
} from 'react-feather'
import '../styles/global.css'

async function getCurrentUrl() {
  const [tab] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true
  })
  if (tab.url) {
    const tabUrl = new URL(tab.url)
    return `${tabUrl.origin}${tabUrl.pathname}`
  }
  return null
}

function handleLastError() {
  const lastError = browser.runtime.lastError
  if (lastError) {
    console.log(lastError.message)
  }
}

async function sendToggleMessage(msgType: 'enable' | 'disable') {
  const [tab] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true
  })
  tab?.id &&
    browser.tabs.sendMessage(tab.id, { type: msgType }).catch(handleLastError)
}

const MAX_URL_LENGTH = 2048 // Maximum allowed URL length

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export default function App() {
  const [urlError, setUrlError] = useState('')
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const { settings, setSettings } = useSettings()
  const [newUrl, setNewUrl] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>(
    'success'
  )
  const [addButtonState, setAddButtonState] = useState('default')
  const matched = currentUrl ? settings?.urlList.includes(currentUrl) : false
  const listRef = useRef<HTMLDivElement>(null)
  const [showTopGradient, setShowTopGradient] = useState(false)
  const [showBottomGradient, setShowBottomGradient] = useState(true)

  useEffect(() => {
    ;(async () => setCurrentUrl(await getCurrentUrl()))()
  }, [])

  useEffect(() => {
    const listElement = listRef.current
    if (listElement) {
      const handleScroll = () => {
        setShowTopGradient(listElement.scrollTop > 0)
        setShowBottomGradient(
          listElement.scrollTop <
            listElement.scrollHeight - listElement.clientHeight - 1
        )
      }
      listElement.addEventListener('scroll', handleScroll)
      handleScroll() // Initial check
      return () => listElement.removeEventListener('scroll', handleScroll)
    }
  }, [settings?.urlList])

  async function handleToggleClick() {
    if (!currentUrl) return

    let newUrlList: ISettings['urlList']

    if (matched) {
      scrollToUrl(currentUrl)
      setTimeout(async () => {
        newUrlList = settings?.urlList.filter((url) => url !== currentUrl) ?? []
        await updateUrlList(newUrlList)
        sendToggleMessage('disable')
        showFeedbackMessage('URL已启用', 'success')
      }, 300) // Wait for scroll animation to complete
    } else {
      newUrlList = [currentUrl, ...(settings?.urlList ?? [])]
      await updateUrlList(newUrlList)
      sendToggleMessage('enable')
      showFeedbackMessage('URL已禁用', 'success')
      scrollToUrl(currentUrl)
    }
  }

  function validateUrl(url: string) {
    if (!url.trim()) {
      setUrlError('URL不能为空')
      return false
    }
    if (url.length > MAX_URL_LENGTH) {
      setUrlError(`URL长度不能超过${MAX_URL_LENGTH}个字符`)
      return false
    }
    if (!isValidUrl(url)) {
      setUrlError('请输入有效的URL')
      return false
    }
    setUrlError('')
    return true
  }

  async function handleAddUrl() {
    if (addButtonState !== 'default' || !validateUrl(newUrl)) return

    if (!settings?.urlList.includes(newUrl)) {
      setAddButtonState('loading')
      const newUrlList = [newUrl, ...(settings?.urlList ?? [])]
      await updateUrlList(newUrlList)
      setAddButtonState('success')
      showFeedbackMessage('URL已添加', 'success')
      setTimeout(() => {
        setAddButtonState('default')
        setNewUrl('')
      }, 1000)
      setTimeout(() => scrollToUrl(newUrl), 100)
    } else {
      setAddButtonState('error')
      showFeedbackMessage('URL已存在', 'error')
      setTimeout(() => setAddButtonState('default'), 2000)
    }
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleAddUrl()
    }
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard
      .writeText(url)
      .then(() => showFeedbackMessage('URL已复制', 'success'))
      .catch(() => showFeedbackMessage('复制失败', 'error'))
  }

  async function handleRemoveUrl(url: string) {
    scrollToUrl(url)
    setTimeout(async () => {
      const newUrlList = settings?.urlList.filter((u) => u !== url) ?? []
      await updateUrlList(newUrlList)
      showFeedbackMessage('URL已移除', 'success')
    }, 0) // Wait for scroll animation to complete
  }

  function scrollToUrl(url: string) {
    if (listRef.current) {
      const urlElement = listRef.current.querySelector(`[data-url="${url}"]`)
      if (urlElement) {
        urlElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

  async function updateUrlList(newUrlList: ISettings['urlList']) {
    await utils.setSettings({ urlList: newUrlList })
    setSettings({ urlList: newUrlList })
  }

  function showFeedbackMessage(message: string, type: 'success' | 'error') {
    setFeedbackMessage(message)
    setFeedbackType(type)
    setShowFeedback(true)
    setTimeout(() => setShowFeedback(false), 2000)
  }

  const addButtonIcon = () => {
    switch (addButtonState) {
      case 'success':
        return <Check size={20} />
      case 'error':
        return <AlertTriangle size={20} />
      default:
        return <Plus size={20} />
    }
  }

  const addButtonColor = () => {
    switch (addButtonState) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-blue-500 hover:bg-blue-600'
    }
  }
  function scrollToTop() {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function scrollToBottom() {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="w-80 p-4 bg-white text-gray-800 dark:bg-gray-800 dark:text-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" className="w-6 h-6" alt="Logo" />
          <h1 className="text-lg font-semibold">Awesome Preview</h1>
        </div>
      </div>

      {/* New tooltip */}
      <div className="mb-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
        <Info size={16} className="mr-2" />
        <div className={'flex'}>
          <span>按住 </span>
          <div className="bg-white border border-gray-300 rounded-md shadow-md px-1 mx-1">
            <span className="font-bold"> Shift </span>
          </div>
          <span> + 点击链接即可预览</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => {
              setNewUrl(e.target.value)
              validateUrl(e.target.value)
            }}
            onKeyPress={handleKeyPress}
            placeholder="输入要禁用的URL"
            className={`flex-grow p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 ${
              urlError ? 'border-red-500' : ''
            }`}
          />
          <motion.button
            whileTap={
              addButtonState === 'default' && newUrl.trim()
                ? { scale: 0.95 }
                : {}
            }
            onClick={handleAddUrl}
            className={`p-2 text-white rounded-md ${
              newUrl.trim()
                ? addButtonColor()
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={addButtonState !== 'default' || !newUrl.trim()}
          >
            {addButtonIcon()}
          </motion.button>
        </div>
        {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
      </div>

      <div className="relative mb-4 h-64">
        {' '}
        {/* 增加列表高度 */}
        <div
          ref={listRef}
          className="h-full overflow-y-scroll scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <AnimatePresence>
            {settings?.urlList.map((url) => (
              <motion.li
                key={url}
                data-url={url}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-2"
                onDoubleClick={() => handleCopyUrl(url)}
              >
                <span className="text-sm truncate flex-grow mr-2">{url}</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRemoveUrl(url)}
                  className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <X size={16} />
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </div>
        {showTopGradient && (
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
        )}
        {showBottomGradient && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
        )}
        {showTopGradient && (
          <button
            onClick={scrollToTop}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md"
          >
            <ChevronUp size={20} />
          </button>
        )}
        {showBottomGradient && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md"
          >
            <ChevronDown size={20} />
          </button>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`w-full py-2 px-4 rounded-md text-white ${
          matched
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-red-500 hover:bg-red-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={!currentUrl}
        onClick={handleToggleClick}
      >
        {matched ? (
          <span className="flex items-center justify-center">
            <Check size={16} className="mr-2" /> 启用当前URL
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Minus size={16} className="mr-2" /> 禁用当前URL
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg flex items-center ${
              feedbackType === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {feedbackType === 'success' ? (
              <Check size={16} className="mr-2" />
            ) : (
              <AlertTriangle size={16} className="mr-2" />
            )}
            <span className="text-white">{feedbackMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
