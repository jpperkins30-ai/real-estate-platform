# PowerShell script to run core layout tests with Vitest
cd client

echo "Running Core Layout Tests..."

# Test Core Layout Components
$ErrorActionPreference = 'Stop'

Write-Host "`nRunning Core Components tests...`n" -ForegroundColor Green
    
# Run core component tests
npx vitest run "src/_tests_/TC*_components_multiframe_*" --config ./vitest.config.ts --no-coverage

Write-Host "`nRunning Panel Registry tests...`n" -ForegroundColor Green
    
# Run panel registry tests  
npx vitest run src/_tests_/TC301_services_panelContentRegistry.test.tsx --config ./vitest.config.ts --no-coverage

Write-Host "`nRunning MultiFrameContainer tests...`n" -ForegroundColor Green
    
# Run MultiFrameContainer tests
npx vitest run src/_tests_/TC201_components_MultiFrameContainer.test.tsx --config ./vitest.config.ts --no-coverage

Write-Host "`nRunning Enhanced Container tests...`n" -ForegroundColor Green
    
# Run Enhanced Container tests
npx vitest run src/_tests_/TC201_components_EnhancedMultiFrameContainer.test.tsx --config ./vitest.config.ts --no-coverage

Write-Host "`nRunning DB Connection tests...`n" -ForegroundColor Green
    
# Run DB Connection tests
npx vitest run src/_tests_/TC2201_services_dbConnection.test.ts --config ./vitest.config.ts --no-coverage

echo "All core layout tests completed!" 