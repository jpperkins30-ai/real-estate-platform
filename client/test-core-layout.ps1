# PowerShell script to run core layout tests with Vitest
cd client

echo "Running Core Layout Tests..."

# Run core components tests
npx vitest run src/__tests__/components/multiframe/ --config ./vitest.config.ts --no-coverage

echo "Running Panel Registry Tests..."

# Run panel registry service tests
npx vitest run src/__tests__/services/panelContentRegistry.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running MultiFrameContainer Tests..."

# Run container tests
npx vitest run src/__tests__/components/MultiFrameContainer.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running EnhancedMultiFrameContainer Tests..."

# Run enhanced container tests
npx vitest run src/__tests__/components/EnhancedMultiFrameContainer.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running Database Integration Tests..."

# Run database integration tests
npx vitest run src/__tests__/services/dbConnection.test.ts --config ./vitest.config.ts --no-coverage

echo "All core layout tests completed!" 