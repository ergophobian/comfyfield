import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// /comfy/* is proxied to a ComfyUI-compatible API so the browser never sees the key.
// Local ComfyUI: COMFY_URL=http://127.0.0.1:8188
// Comfy Cloud:   COMFY_URL=<cloud API base>, COMFY_API_KEY=<key>
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.COMFY_URL || 'http://127.0.0.1:8188'
  const headers = env.COMFY_API_KEY ? { 'X-API-Key': env.COMFY_API_KEY } : {}
  const proxy = { target, changeOrigin: true, headers, rewrite: (p) => p.replace(/^\/comfy/, '') }
  return {
    plugins: [react()],
    server: { proxy: { '/comfy': proxy } },
    preview: { proxy: { '/comfy': proxy } },
  }
})
