# run-coverage.ps1
# PowerShell script to run tests with coverage in Windows environment

Write-Host "Running tests with coverage..." -ForegroundColor Green

# Change to the client directory if not already there
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("client")) {
    if (Test-Path ".\client") {
        Set-Location -Path ".\client"
        Write-Host "Changed directory to client folder" -ForegroundColor Yellow
    }
}

# Run the tests with coverage
try {
    Write-Host "Executing npm test:coverage command..." -ForegroundColor Cyan
    npm run test:coverage
    
    # Check if coverage is above threshold
    $coverageFile = ".\coverage\coverage-summary.json"
    if (Test-Path $coverageFile) {
        $coverageData = Get-Content $coverageFile | ConvertFrom-Json
        $totalCoverage = $coverageData.total.lines.pct
        
        if ($totalCoverage -lt 80) {
            Write-Host "Coverage below threshold: $totalCoverage%" -ForegroundColor Red
            exit 1
        } else {
            Write-Host "Coverage is sufficient: $totalCoverage%" -ForegroundColor Green
        }
    } else {
        Write-Host "Coverage file not found: $coverageFile" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error running tests with coverage: $_" -ForegroundColor Red
    exit 1
} finally {
    # Return to original directory if we changed it
    if (-not $currentDir.Path.EndsWith("client")) {
        Set-Location -Path $currentDir
        Write-Host "Returned to original directory" -ForegroundColor Yellow
    }
} 