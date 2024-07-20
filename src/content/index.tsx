import { signal } from '@preact/signals'
import { render } from 'preact'
import browser from 'webextension-polyfill'
import { getSettings } from '../common/utils'
import App from './App'
import '../styles/global.css'

const containerId = '__XiCheng_awesome-preview-container'

const open = signal(false)
const url = signal<string | null>(null)
const title = signal<string | null>(null)
const loading = signal(false)
const shiftKey = signal(false)
const origin = signal({ x: 0, y: 0 })

function shouldHandleClickEvent(href: string) {
  if (!href) return false

  try {
    const url = new URL(href)

    if (url.origin === location.origin && url.pathname === location.pathname) {
      return false
    }

    // mixed content will be blocked by browser
    if (url.protocol !== location.protocol) {
      return false
    }
  } catch (err) {
    console.error(err)
    return false
  }
  if (/^(mailto|tel|javascript):/.test(href)) {
    return false
  }
  return true
}

// function destroyApp() {
//   const container = document.querySelector(`#${containerId}`);
//   container && render(null, container);
// }

function handleWindowClickEvent(event: MouseEvent) {
  if (!shiftKey.value) return false
  const composedPath = event.composedPath()
  const target = composedPath.find((node) => node instanceof HTMLAnchorElement)

  if (target instanceof HTMLAnchorElement) {
    const shouldHandle = shouldHandleClickEvent(target.href)
    if (shouldHandle) {
      event.preventDefault()
      event.stopPropagation()
      origin.value = { x: event.clientX, y: event.clientY }
      console.log(`🚀 ~ handleWindowClickEvent ~ origin.value:`, origin.value)
      url.value = target.href
      open.value = true
      title.value = target.text
      loading.value = true
    }
  }
}

async function main() {
  const root = document.createElement('div')
  root.id = '__XiCheng-awesome-preview'
  document.body.appendChild(root)

  const shadowRoot = root.attachShadow({ mode: 'open' })

  const appContainer = document.createElement('div')
  appContainer.id = containerId
  shadowRoot.appendChild(appContainer)

  if (import.meta.hot) {
    const { addViteStyleTarget } = await import(
      '@samrum/vite-plugin-web-extension/client'
    )

    await addViteStyleTarget(shadowRoot)
  } else {
    import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS.forEach((cssPath) => {
      const styleEl = document.createElement('link')
      styleEl.setAttribute('rel', 'stylesheet')
      styleEl.setAttribute('href', browser.runtime.getURL(cssPath))
      shadowRoot.appendChild(styleEl)
    })
  }

  render(
    <App
      open={open}
      url={url}
      title={title}
      loading={loading}
      origin={origin}
    />,
    appContainer
  )

  const settings = await getSettings()
  const currentUrl = `${location.origin}${location.pathname}`
  if (!settings.urlList.includes(currentUrl)) {
    window.addEventListener('click', handleWindowClickEvent, { capture: true })
  }
  window.addEventListener('keydown', function (event) {
    if (event.key === 'Shift') {
      shiftKey.value = true
    }
  })

  window.addEventListener(
    'keyup',
    function (event) {
      if (event.key === 'Shift') {
        shiftKey.value = false
      }
    },
    {
      capture: true
    }
  )

  browser.runtime.onMessage.addListener(
    (message) => {
      switch (message.type) {
        case 'enable':
          window.addEventListener('click', handleWindowClickEvent, {
            capture: true
          })
          break
        case 'disable':
          window.removeEventListener('click', handleWindowClickEvent, {
            capture: true
          })
          break
      }
    },
    {
      capture: true
    }
  )
}

main()
