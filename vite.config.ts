import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { brandHtml } from './vite/brandHtml'

export default defineConfig({
  plugins: [react(), tailwindcss(), brandHtml()],
  build: {
    // O chunk do three sozinho passa de 700KB, mas só baixa junto com a cena,
    // depois que a interface já apareceu
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        codeSplitting: {
          // As bibliotecas 3D mudam pouco: em chunks próprios, continuam no
          // cache do navegador quando só o código do app muda. Sem puxar as
          // dependências junto, senão o React iria para o chunk do R3F e o
          // pacote inicial passaria a depender dele
          includeDependenciesRecursively: false,
          groups: [
            { name: 'three', test: /[\\/]node_modules[\\/]three[\\/]/, priority: 2 },
            { name: 'react-three', test: /[\\/]node_modules[\\/](@react-three|three-stdlib)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
