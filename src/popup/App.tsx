import browser from 'webextension-polyfill'
import { useEffect, useState } from 'preact/hooks'
import { useSettings } from '../hooks/use-settings'
import * as utils from '../common/utils'
import { ISettings } from '../common/types'
import cx from 'classnames'
import '../styles/global.css'
import { useHotkeys } from 'react-hotkeys-hook'

async function getCurrentUrl() {
  const [tab] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
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
    lastFocusedWindow: true,
  })
  tab?.id &&
    browser.tabs.sendMessage(tab.id, { type: msgType }).catch(handleLastError)
}

export default function App() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const { settings, setSettings } = useSettings()
  const matched = currentUrl ? settings?.urlList.includes(currentUrl) : false

  useEffect(() => {
    ;(async () => setCurrentUrl(await getCurrentUrl()))()
  }, [])

  async function handleToggleClick() {
    let newUrlList: ISettings['urlList']

    if (matched) {
      newUrlList = settings?.urlList.filter((url) => url !== currentUrl) ?? []
      sendToggleMessage('disable')
    } else {
      newUrlList = currentUrl ? [...(settings?.urlList ?? []), currentUrl] : []
      sendToggleMessage('enable')
    }

    await utils.setSettings({ urlList: newUrlList })
    setSettings({ urlList: newUrlList })
  }

  async function saveUrlList(newUrlList: ISettings['urlList']) {
    if (currentUrl) {
      if (
        settings?.urlList.includes(currentUrl) &&
        !newUrlList.includes(currentUrl)
      ) {
        sendToggleMessage('disable')
      } else if (
        !settings?.urlList.includes(currentUrl) &&
        newUrlList.includes(currentUrl)
      ) {
        sendToggleMessage('enable')
      }
    }
    await utils.setSettings({ urlList: newUrlList })
    setSettings({ urlList: newUrlList })
  }

  const textareaRef = useHotkeys<HTMLTextAreaElement>(
    'ctrl+s, meta+s',
    () => {
      textareaRef.current && saveUrlList(textareaRef.current.value.split('\n'))
    },
    { preventDefault: true, enableOnFormTags: ['textarea'] }
  )

  async function handleUrlsOnChange(event: Event) {
    if (event.target instanceof HTMLTextAreaElement) {
      const newUrlList = event.target.value.split('\n')
      saveUrlList(newUrlList)
    }
  }

  return (
    <div className="w-64 pb-3.5 text-sm text-zinc-900">
      <div className="flex select-none justify-between border-b p-2.5">
        <div className="inline-flex gap-2 items-center">
          <img src="/logo.png" className="inline-block h-6 w-6" />
          <span>Smart Page</span>
        </div>
      </div>
      <div className="mt-3.5 flex flex-col gap-2.5 px-3.5">
        <div className="flex flex-col gap-1.5">
          <label> 禁用 URLs: </label>
          <div>
            <textarea
              ref={textareaRef}
              className="h-48 max-h-80 w-full rounded-md border-gray-300 py-1 px-1.5 text-sm shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={settings?.urlList.join('\n') ?? ''}
              onChange={handleUrlsOnChange}
            />
            <div className="text-[10px] text-zinc-400">
              使用{' '}
              <kbd className="kbd border-zinc-400">回车↩︎</kbd>
              {' '}分离 Urls
            </div>
          </div>
        </div>
        <div>
          <button
            className={cx(
              'w-full rounded px-6 py-2 text-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-400',
              {
                'bg-red-600 hover:bg-red-700': !matched,
                'bg-blue-600 hover:bg-blue-700': matched,
              }
            )}
            disabled={!currentUrl}
            onClick={handleToggleClick}
          >
            {!matched ? '禁用' : '启用'} 当前 URL
          </button>
        </div>
      </div>
    </div>
  )
}
