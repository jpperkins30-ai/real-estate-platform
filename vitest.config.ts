import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    include: ['./src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      enabled: false
    },
    pool: 'forks',
    reporters: ['verbose']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}) 