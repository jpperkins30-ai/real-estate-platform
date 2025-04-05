# Add test case description comments to test files
#
# This script adds a test case description comment to the first line of each test file

Write-Host "Adding test case description comments to test files..." -ForegroundColor Cyan

# Paths
$testDir = "src/__tests__"
$testPlanPath = "test-plan.json"

# Ensure the directories exist
if (-not (Test-Path $testDir)) {
    Write-Host "Test directory not found: $testDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $testPlanPath)) {
    Write-Host "Test plan not found: $testPlanPath" -ForegroundColor Red
    exit 1
}

# Load test plan
$testPlan = Get-Content -Path $testPlanPath -Raw | ConvertFrom-Json
$testCases = $testPlan.testCases

# Find all test files
$testFiles = Get-ChildItem -Path $testDir -File | Where-Object { $_.Name -match '^TC\d+_.+\.test\.(ts|tsx)$' }

Write-Host "Found $($testFiles.Count) test files to update" -ForegroundColor Yellow

$updatedCount = 0

foreach ($file in $testFiles) {
    $fileName = $file.Name
    $filePath = $file.FullName
    
    # Extract TC ID from filename
    if ($fileName -match '^(TC\d+)_') {
        $tcId = $matches[1]
        $tcNumber = $tcId -replace 'TC', ''
        
        # Find matching test case in test plan
        $matchedTC = $testCases | Where-Object { $_.id -eq $tcId } | Select-Object -First 1
        
        if ($null -eq $matchedTC) {
            Write-Host "No matching test case found for ID: $tcId in file $fileName. Skipping." -ForegroundColor Yellow
            continue
        }
        
        # Read file content
        $content = Get-Content -Path $filePath -Raw
        $lines = $content -split "\r?\n"
        
        # Check if first line already has a test case comment
        if ($lines[0] -match '^// Test Case \d+:') {
            Write-Host "File already has a test case comment: $fileName. Updating." -ForegroundColor Yellow
        }
        
        # Create new content with test case description - using just the number part (without "TC" prefix)
        $tcDescription = $matchedTC.description
        $newFirstLine = "// Test Case $tcNumber`: $tcDescription"
        
        if ($lines[0] -match '^// Test Case \d+:') {
            # Replace existing comment
            $lines[0] = $newFirstLine
        } else {
            # Add new comment at the top
            $lines = @($newFirstLine) + $lines
        }
        
        $newContent = $lines -join "`r`n"
        
        # Write updated content
        Set-Content -Path $filePath -Value $newContent
        Write-Host "Updated test case comment in $fileName" -ForegroundColor Green
        $updatedCount++
    } else {
        Write-Host "File name does not match expected pattern: $fileName. Skipping." -ForegroundColor Yellow
    }
}

# Display results
Write-Host ""
Write-Host "Update complete: $updatedCount files updated" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run precommit' to verify the files pass validation" -ForegroundColor Yellow
Write-Host "2. Run 'npm test' to confirm all tests still work" -ForegroundColor Yellow 