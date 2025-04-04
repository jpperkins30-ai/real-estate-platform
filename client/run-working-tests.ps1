# run-working-tests.ps1
# PowerShell script to run only the working tests we've fixed

Write-Host "Running fixed tests..." -ForegroundColor Green

# Change to the client directory if not already there
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("client")) {
    if (Test-Path ".\client") {
        Set-Location -Path ".\client"
        Write-Host "Changed directory to client folder" -ForegroundColor Yellow
    }
}

# Array of working test files
$workingTests = @(
    "src/__tests__/components/PanelHeader.test.tsx",
    "src/__tests__/integration/ControllerWizardLauncher.test.tsx",
    "src/__tests__/components/DraggablePanel.test.tsx"
)

# Results tracking
$passedTests = @()
$failedTests = @()

# Run each test file individually
foreach ($file in $workingTests) {
    Write-Host "Testing: $file" -ForegroundColor Cyan
    
    # Run the individual test file
    $output = npx vitest run $file --reporter=basic 2>&1
    
    # Check if the test passed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PASSED" -ForegroundColor Green
        $passedTests += $file
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $failedTests += $file
        
        # Display the error if the test failed
        $output | ForEach-Object {
            Write-Host $_ -ForegroundColor Gray
        }
        
        Write-Host "" # Empty line for separation
    }
}

# Report summary
Write-Host "`nTEST SUMMARY:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host "Passed: $($passedTests.Count) tests" -ForegroundColor Green
Write-Host "Failed: $($failedTests.Count) tests" -ForegroundColor Red

if ($failedTests.Count -gt 0) {
    Write-Host "`nFAILED TESTS:" -ForegroundColor Red
    foreach ($test in $failedTests) {
        Write-Host "- $test" -ForegroundColor Red
    }
    
    # Return to original directory if we changed it
    if (-not $currentDir.Path.EndsWith("client")) {
        Set-Location -Path $currentDir
    }
    
    exit 1
} else {
    Write-Host "`nAll fixed tests are passing!" -ForegroundColor Green
    
    # Return to original directory if we changed it
    if (-not $currentDir.Path.EndsWith("client")) {
        Set-Location -Path $currentDir
    }
    
    exit 0
} 