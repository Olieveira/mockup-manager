import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { brandHtml } from './vite/brandHtml'

export default defineConfig({
  plugins: [react(), tailwindcss(), brandHtml()],
})
