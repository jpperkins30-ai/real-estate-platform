# PowerShell script to run filter system tests with Vitest
cd client

echo "Running Filter System Tests..."

# Run specific filter system tests
npx vitest run src/_tests_/TC1701_context_FilterContext.test.tsx src/_tests_/TC2301_services_filterService.test.ts --config ./vitest.config.ts --no-coverage

echo "Running Panel State Tests..."

# Run panel state tests
npx vitest run src/_tests_/TC1401_hooks_usePanelState.test.tsx src/_tests_/TC2401_services_panelStateService.test.ts --config ./vitest.config.ts --no-coverage

echo "Running Filter UI Component Tests..."

# Run UI component tests
npx vitest run src/_tests_/TC1001_components_multiframe_filters_FilterPanel.test.tsx src/_tests_/TC1301_hooks_useFilter.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running Integration Tests..."

# Run integration tests
npx vitest run src/_tests_/TC2603_integration_FilterSystemIntegration.test.tsx --config ./vitest.config.ts --no-coverage

echo "All filter system tests completed!" 