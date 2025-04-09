import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/_tests_/TC*.test.ts'],
    hookTimeout: 120000,
    testTimeout: 120000,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/types/', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}); 