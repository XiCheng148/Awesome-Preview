import { signal, effect } from '@preact/signals'
import { render } from 'preact'
import { useEffect, useCallback } from 'preact/hooks'
import browser from 'webextension-polyfill'
import { getSettings } from '../common/utils'
import App from './App'
import '../styles/global.css'

const CONTAINER_ID = '__XiCheng_awesome-preview-container'

const state = {
  open: signal(false),
  url: signal<string | null>(null),
  title: signal<string | null>(null),
  loading: signal(false),
  shiftKey: signal(false),
  origin: signal({ x: 0, y: 0 }),
}

const isValidUrl = (href: string): boolean => {
  if (!href) return false
  try {
    const url = new URL(href)
    return (
      url.origin !== location.origin ||
      url.pathname !== location.pathname
    ) && url.protocol === location.protocol
  } catch (err) {
    console.error(err)
    return false
  }
}

const handleWindowClickEvent = (event: MouseEvent) => {
  if (!state.shiftKey.value) return

  const target = event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)

  if (target && isValidUrl(target.href) && !/^(mailto|tel|javascript):/.test(target.href)) {
    event.preventDefault()
    event.stopPropagation()
    state.origin.value = { x: event.clientX, y: event.clientY }
    state.url.value = target.href
    state.open.value = true
    state.title.value = target.text
    state.loading.value = true
  }
}

function AppWrapper() {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      state.shiftKey.value = true
    }
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      state.shiftKey.value = false
    } else if (event.key === 'Escape' && state.open.value) {
      state.open.value = false
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  useEffect(() => {
    const setup = async () => {
      const settings = await getSettings()
      const currentUrl = `${location.origin}${location.pathname}`
      if (!settings.urlList.includes(currentUrl)) {
        window.addEventListener('click', handleWindowClickEvent, { capture: true })
      }
    }

    setup()

    return () => {
      window.removeEventListener('click', handleWindowClickEvent, { capture: true })
    }
  }, [])

  useEffect(() => {
    const messageListener = (message: any) => {
      const action = message.type === 'enable' ? 'addEventListener' : 'removeEventListener'
      window[action]('click', handleWindowClickEvent, { capture: true })
    }

    browser.runtime.onMessage.addListener(messageListener)

    return () => {
      browser.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  return <App {...state} />
}

async function main() {
  const root = document.createElement('div')
  root.id = '__XiCheng-awesome-preview'
  document.body.appendChild(root)

  const shadowRoot = root.attachShadow({ mode: 'open' })

  const appContainer = document.createElement('div')
  appContainer.id = CONTAINER_ID
  shadowRoot.appendChild(appContainer)

  if (import.meta.hot) {
    const { addViteStyleTarget } = await import('@samrum/vite-plugin-web-extension/client')
    await addViteStyleTarget(shadowRoot)
  } else {
    import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS.forEach((cssPath) => {
      const styleEl = document.createElement('link')
      styleEl.setAttribute('rel', 'stylesheet')
      styleEl.setAttribute('href', browser.runtime.getURL(cssPath))
      shadowRoot.appendChild(styleEl)
    })
  }

  render(<AppWrapper />, appContainer)
}

main()
