import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {
    target: env.API_PROXY_TARGET || 'https://unsecured-sanitizer-porcupine.ngrok-free.dev',
    changeOrigin: true,
    cookieDomainRewrite: '',
    headers: { 'ngrok-skip-browser-warning': 'true' },
  }
  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173, strictPort: true, proxy: { '/api': proxy, '/sanctum': proxy, '/storage': proxy } },
  }
})
