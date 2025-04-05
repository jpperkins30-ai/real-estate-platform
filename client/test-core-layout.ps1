# PowerShell script to run core layout tests with Vitest
cd client

echo "Running Core Layout Tests..."

# Run core components tests - Updated for flattened structure
npx vitest run "src/__tests__/components_multiframe_*" --config ./vitest.config.ts --no-coverage

echo "Running Panel Registry Tests..."

# Run panel registry service tests - Updated for flattened structure
npx vitest run src/__tests__/services_panelContentRegistry.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running MultiFrameContainer Tests..."

# Run container tests - Updated for flattened structure
npx vitest run src/__tests__/components_MultiFrameContainer.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running EnhancedMultiFrameContainer Tests..."

# Run enhanced container tests - Updated for flattened structure
npx vitest run src/__tests__/components_EnhancedMultiFrameContainer.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running Database Integration Tests..."

# Run database integration tests - Updated for flattened structure
npx vitest run src/__tests__/services_dbConnection.test.ts --config ./vitest.config.ts --no-coverage

echo "All core layout tests completed!" 