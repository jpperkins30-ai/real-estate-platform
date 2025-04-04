# test-coverage.ps1
# PowerShell script to check test coverage

Write-Host "Running test coverage..."
npx vitest run --coverage

# Check if coverage is above threshold
$coverageFile = ".\coverage\coverage-summary.json"
if (Test-Path $coverageFile) {
    $coverageData = Get-Content $coverageFile | ConvertFrom-Json
    $totalCoverage = $coverageData.total.lines.pct
    
    if ($totalCoverage -lt 80) {
        Write-Host "Coverage below threshold: $totalCoverage%"
        exit 1
    } else {
        Write-Host "Coverage is sufficient: $totalCoverage%"
    }
} else {
    Write-Host "Coverage file not found: $coverageFile"
    exit 1
} 