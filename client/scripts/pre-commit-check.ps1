# Pre-commit check for test file structure
#
# Run this script before committing to ensure test files follow the standardized structure

Write-Host "Validating test file structure..." -ForegroundColor Cyan

# Path to test directory
$testDir = "src/__tests__"

# Ensure the directory exists
if (-not (Test-Path $testDir)) {
    Write-Host "Test directory not found: $testDir" -ForegroundColor Red
    exit 1
}

# Find all test files
$testFiles = Get-ChildItem -Path $testDir -File | Where-Object { $_.Name -match '\.test\.(ts|tsx)$' }

$errors = @()
$validCount = 0

Write-Host "Checking $($testFiles.Count) test files..." -ForegroundColor Yellow

foreach ($file in $testFiles) {
    $fileName = $file.Name
    $filePath = $file.FullName
    $issues = @()
    
    # Check if file is in the correct directory (not in subdirectories)
    if ($file.DirectoryName -ne (Resolve-Path $testDir).Path) {
        $issues += "Not in the root test directory"
    }
    
    # Check for proper naming convention (TCxxx_)
    if (-not ($fileName -match '^TC\d+_.+\.test\.(ts|tsx)$')) {
        $issues += "Missing test case ID prefix (should start with 'TCxxx_')"
    }
    
    # Check first line for test case description
    $firstLine = Get-Content -Path $filePath -TotalCount 1
    if (-not ($firstLine -match '^// Test Case \d+:')) {
        $issues += "Missing test case description comment on first line"
    }
    
    if ($issues.Count -gt 0) {
        $errors += [PSCustomObject]@{
            FileName = $fileName
            Issues = $issues
        }
    } else {
        $validCount++
    }
}

# Display results
Write-Host ""
Write-Host "Test File Validation Results:" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan
Write-Host "Valid files: $validCount / $($testFiles.Count)" -ForegroundColor $(if ($validCount -eq $testFiles.Count) { "Green" } else { "Yellow" })

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Files with issues:" -ForegroundColor Red
    foreach ($fileError in $errors) {
        Write-Host "$($fileError.FileName)" -ForegroundColor Red
        foreach ($issue in $fileError.Issues) {
            Write-Host " - $issue" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "Run 'npm run create-test' to create properly structured test files" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "All test files follow the standard structure!" -ForegroundColor Green
} 