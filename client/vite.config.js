import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Add this rollup option
    rollupOptions: {
      external: [
        /@tailwindcss\/oxide.*/,
      ],
    },
  },
})