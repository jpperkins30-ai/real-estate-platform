# Run tests using the central test directory only
Write-Host "Running standardized tests from the central src/__tests__ directory..."
npm test -- src/__tests__

# Check test result
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed. Please check the output above for details." -ForegroundColor Red
} 