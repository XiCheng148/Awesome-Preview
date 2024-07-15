import { defineConfig } from 'vite'
import webExtension from '@samrum/vite-plugin-web-extension'
import manifest from './src/manifest.json'
import manifestV2 from './src/manifest.v2.json'
import preact from '@preact/preset-vite'

const isDev = process.env.NODE_ENV === 'development'
const isFirefox = process.env.EXTENSION === 'firefox'

export default defineConfig({
  plugins: [
    preact(),
    webExtension({
      manifest: isFirefox ? manifestV2 : manifest,
    }),
  ],
  build: {
    minify: !isDev,
    sourcemap: isDev,
    rollupOptions: {
      output: {
        dir: isFirefox ? 'dist/firefox' : 'dist/chromium',
      },
    },
  },
})
