#!/bin/bash
# Run Chunk 5 tests with comprehensive coverage

echo "Running hook tests..."
# Run all hook tests
npx vitest run "src/_tests_/TC*_hooks_*" --config ./vitest.config.ts

echo "Running component tests..."
# Run all component tests
npx vitest run "src/_tests_/TC*_components_*" --config ./vitest.config.ts

echo "Running integration tests..."
# Run all integration tests
npx vitest run "src/_tests_/TC*_integration_*" --config ./vitest.config.ts

echo "All Chunk 5 tests completed!" 