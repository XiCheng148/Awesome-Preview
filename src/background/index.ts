import { isFirefox } from '../common/utils'
import browser from 'webextension-polyfill'
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    browser.tabs.create({ url: 'welcome.html' })
  }
})
if (isFirefox) {
  const HEADERS_TO_STRIP_LOWERCASE = [
    'content-security-policy',
    'x-frame-options'
  ]

  browser.webRequest.onHeadersReceived.addListener(
    (details) => ({
      responseHeaders: details.responseHeaders?.filter(
        (header) =>
          !HEADERS_TO_STRIP_LOWERCASE.includes(header.name.toLowerCase())
      )
    }),
    {
      urls: ['<all_urls>']
    },
    ['blocking', 'responseHeaders']
  )
}
