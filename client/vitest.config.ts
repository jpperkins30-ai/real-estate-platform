/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
        'src/**/*.d.ts',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
      ],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      all: true,
    },
    deps: {
      inline: [/@testing-library\/react/],
    },
    pool: 'forks',
    reporters: ['verbose'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}); 