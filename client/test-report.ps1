# test-report.ps1
# PowerShell script to run each test file individually and report failures

Write-Host "Testing individual test files to identify failures..." -ForegroundColor Cyan

# Change to the client directory if not already there
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("client")) {
    if (Test-Path ".\client") {
        Set-Location -Path ".\client"
        Write-Host "Changed directory to client folder" -ForegroundColor Yellow
    }
}

# Find all test files in the central test directory only
$testFiles = Get-ChildItem -Path "src/__tests__" -Recurse -Include "*.test.ts", "*.test.tsx" | ForEach-Object { $_.FullName }

Write-Host "Found $($testFiles.Count) test files in the central test directory" -ForegroundColor Yellow

# Results tracking
$passedTests = @()
$failedTests = @()

# Run each test file individually
foreach ($file in $testFiles) {
    $relativePath = $file -replace [regex]::Escape((Get-Location)), ""
    $relativePath = $relativePath.TrimStart("\")
    
    Write-Host "Testing: $relativePath" -ForegroundColor Cyan
    
    # Run the individual test file
    $output = npx vitest run $relativePath --reporter=basic 2>&1
    
    # Check if the test passed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PASSED" -ForegroundColor Green
        $passedTests += $relativePath
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $failedTests += $relativePath
        
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
}

# Return to original directory if we changed it
if (-not $currentDir.Path.EndsWith("client")) {
    Set-Location -Path $currentDir
}

# Exit with error code if any tests failed
if ($failedTests.Count -gt 0) {
    exit 1
} else {
    exit 0
} 