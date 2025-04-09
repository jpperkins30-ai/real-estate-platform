import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: react(),
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/test/setup.ts'
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    include: ['./src/_tests_/TC*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**']
    },
    reporters: ['default'],
    pool: 'forks',
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}); 
