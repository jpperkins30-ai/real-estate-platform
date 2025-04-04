# test-runner.ps1 - Comprehensive test runner for real-estate-platform

# Change to the client directory first
Set-Location -Path ".\client" -ErrorAction SilentlyContinue
if (-not $?) {
    Write-Host "Error: Could not navigate to client directory. Make sure you're running this from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "==== Real Estate Platform Test Runner ====" -ForegroundColor Cyan

Write-Host "Running component tests..." -ForegroundColor Yellow
npx vitest run --config ./vitest.config.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Component tests failed. Please fix before committing." -ForegroundColor Red
    Set-Location -Path ".."
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Checking test coverage..." -ForegroundColor Yellow
npx vitest run --coverage --config ./vitest.config.ts
$COVERAGE_RESULT = $LASTEXITCODE
if ($COVERAGE_RESULT -ne 0) {
    Write-Host "❌ Coverage thresholds not met. Please improve test coverage before committing." -ForegroundColor Red
    Set-Location -Path ".."
    exit $COVERAGE_RESULT
}

# Run specific component tests to ensure critical features work
Write-Host ""
Write-Host "Running critical component tests..." -ForegroundColor Yellow
npx vitest run -t "DraggablePanel|MultiFrameContainer|AdvancedLayout" --config ./vitest.config.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Critical component tests failed. Please fix before committing." -ForegroundColor Red
    Set-Location -Path ".."
    exit $LASTEXITCODE
}

# Generate test report
Write-Host ""
Write-Host "Generating test report..." -ForegroundColor Yellow
npx vitest run --reporter=html --config ./vitest.config.ts

# Check for specific directory test success
Write-Host ""
Write-Host "Validating core functionality tests..." -ForegroundColor Yellow
npx vitest run "src/components/multiframe/__tests__" --config ./vitest.config.ts
$CORE_TEST_RESULT = $LASTEXITCODE
if ($CORE_TEST_RESULT -ne 0) {
    Write-Host "❌ Core functionality tests failed. Please fix before committing." -ForegroundColor Red
    Set-Location -Path ".."
    exit $CORE_TEST_RESULT
}

# Return to the original directory
Set-Location -Path ".."

Write-Host ""
Write-Host "✅ All tests passed successfully!" -ForegroundColor Green
Write-Host "Report generated at ./client/html-report" -ForegroundColor Green
Write-Host "==== Test Suite Complete ====" -ForegroundColor Cyan 