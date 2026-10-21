import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import comfyfieldApi from './server/plugin.js'
import { bindHost } from './server/local-access.js'

export default defineConfig(({ mode }) => {
  // Expose .env values (FAL_KEY, COMFY_URL, ...) to the local API as fallbacks.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  const host = bindHost()
  return {
    plugins: [react(), comfyfieldApi()],
    // Checks write Chrome profiles to outputs/ and the app writes .comfyfield/. On Windows, watching
    // a file Chrome holds open crashes the dev server, and the watcher can block a check's renames.
    server: { host, allowedHosts: process.env.COMFYFIELD_HOST ? [process.env.COMFYFIELD_HOST] : [], watch: { ignored: ['**/outputs/**', '**/.comfyfield/**'] } },
    preview: { host },
  }
})
