#!/bin/bash
# client/test-chunk5-comprehensive.sh

cd client

echo "Running All Custom Hooks Tests..."
npx vitest run src/__tests__/hooks/ --config ./vitest.config.ts

echo "Running All Components Tests..."
npx vitest run src/__tests__/components/ --config ./vitest.config.ts

echo "Running Integration Tests..."
npx vitest run src/__tests__/integration/ --config ./vitest.config.ts

echo "All tests completed! Check results above." 