import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    entry: 'src/main/index.js',
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    entry: 'src/preload/index.js',
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
    }
  }
})
