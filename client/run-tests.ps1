# run-tests.ps1
# PowerShell script to run tests in Windows environment

Write-Host "Running tests..." -ForegroundColor Green

# Change to the client directory if not already there
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("client")) {
    if (Test-Path ".\client") {
        Set-Location -Path ".\client"
        Write-Host "Changed directory to client folder" -ForegroundColor Yellow
    }
}

# Run the tests
try {
    Write-Host "Executing npm test command..." -ForegroundColor Cyan
    npm run test
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Tests failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    } else {
        Write-Host "Tests completed successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "Error running tests: $_" -ForegroundColor Red
    exit 1
} finally {
    # Return to original directory if we changed it
    if (-not $currentDir.Path.EndsWith("client")) {
        Set-Location -Path $currentDir
        Write-Host "Returned to original directory" -ForegroundColor Yellow
    }
} 