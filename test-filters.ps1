# PowerShell script to run filter system tests with Vitest
cd client

echo "Running Filter System Tests..."

# Run specific filter system tests
npx vitest run src/__tests__/context/FilterContext.test.tsx src/__tests__/services/filterService.test.ts --config ./vitest.config.ts --no-coverage

echo "Running Panel State Tests..."

# Run panel state tests
npx vitest run src/__tests__/hooks/usePanelState.test.tsx src/__tests__/services/panelStateService.test.ts --config ./vitest.config.ts --no-coverage

echo "Running Filter UI Component Tests..."

# Run UI component tests
npx vitest run src/__tests__/components/multiframe/filters/FilterPanel.test.tsx src/__tests__/hooks/useFilter.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running Integration Tests..."

# Run integration tests
npx vitest run src/__tests__/integration/FilterSystemIntegration.test.tsx --config ./vitest.config.ts --no-coverage

echo "All filter system tests completed!" 