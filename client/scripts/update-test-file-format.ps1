# Update test files to standardized format with TC IDs
#
# This script updates all test files in the __tests__ directory to:
# 1. Have TC ID prefixes in filenames
# 2. Include a test case description comment at the top of each file
# 3. Match the standardized structure required by the pre-commit check

Write-Host "Updating test files to standardized format..." -ForegroundColor Cyan

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

# Mapping of component types to TC ID prefixes
$componentPrefixMap = @{
    'LayoutSelector' = 'TC1'
    'MultiFrameContainer' = 'TC2'
    'panelContentRegistry' = 'TC3'
    'AdvancedLayout' = 'TC4'
    'EnhancedMultiFrameContainer' = 'TC5'
    'useDraggable' = 'TC6'
    'PanelContainer' = 'TC7'
    'PanelHeader' = 'TC8'
    'useResizable' = 'TC9'
    'useMaximizable' = 'TC10'
    'usePanelState' = 'TC11'
    'FilterPanel' = 'TC12'
    'FilterContext' = 'TC13'
    'propertySearch' = 'TC14'
    'PanelIntegration' = 'TC15'
}

# Find all test files
$testFiles = Get-ChildItem -Path $testDir -File | Where-Object { $_.Name -match '\.test\.(ts|tsx)$' }

Write-Host "Found $($testFiles.Count) test files to process" -ForegroundColor Yellow

$updatedCount = 0
$skippedCount = 0

foreach ($file in $testFiles) {
    $fileName = $file.Name
    $filePath = $file.FullName
    
    # Skip files that already have the TC prefix
    if ($fileName -match '^TC\d+_') {
        Write-Host "Skipping already formatted file: $fileName" -ForegroundColor Gray
        $skippedCount++
        continue
    }
    
    # Get component name from file name
    $componentName = [System.IO.Path]::GetFileNameWithoutExtension($fileName) -replace '\.test$', ''
    
    # Find the matching test case
    $matchedTC = $null
    $tcId = ""
    
    # Try direct match with test plan descriptions
    foreach ($tc in $testCases) {
        if ($tc.description -like "*$componentName*") {
            $matchedTC = $tc
            $tcId = $tc.id
            break
        }
    }
    
    # If no match found, try to match based on prefix
    if ($null -eq $matchedTC) {
        foreach ($prefix in $componentPrefixMap.Keys) {
            if ($componentName -like "*$prefix*") {
                # Find first available test case with matching prefix
                $tcPrefix = $componentPrefixMap[$prefix]
                $matchingTCs = $testCases | Where-Object { $_.id -like "$tcPrefix*" }
                if ($matchingTCs.Count -gt 0) {
                    $matchedTC = $matchingTCs[0]
                    $tcId = $matchedTC.id
                    break
                }
            }
        }
    }
    
    # If still no match, use a generic TC999 ID
    if ($null -eq $matchedTC) {
        $tcId = "TC999"
        $matchedTC = @{
            id = $tcId
            description = "Verify $componentName functionality"
        }
    }
    
    # Check if the file already has a TC comment at the top
    $content = Get-Content -Path $filePath -Raw
    $lines = $content -split "\r?\n"
    $hasProperComment = $lines[0] -match '^// Test Case \d+:'
    
    # Create the new file name with TC prefix
    $extension = [System.IO.Path]::GetExtension($fileName)
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    $newFileName = "${tcId}_$baseName$extension"
    $newFilePath = Join-Path (Split-Path $filePath) $newFileName
    
    # Update content if needed
    if (-not $hasProperComment) {
        $newContent = "// Test Case $($matchedTC.id): $($matchedTC.description)`r`n$content"
        
        # Write updated content
        Set-Content -Path $filePath -Value $newContent
        Write-Host "Added test case comment to $fileName" -ForegroundColor Green
    }
    
    # Rename the file
    if (Test-Path $newFilePath) {
        Write-Host "Destination file already exists: $newFileName. Skipping rename." -ForegroundColor Yellow
    } else {
        Rename-Item -Path $filePath -NewName $newFileName
        Write-Host "Renamed: $fileName -> $newFileName" -ForegroundColor Green
    }
    
    $updatedCount++
}

# Display results
Write-Host ""
Write-Host "Update complete: $updatedCount files updated, $skippedCount files skipped" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run precommit' to verify the files pass validation" -ForegroundColor Yellow
Write-Host "2. Run 'npm test' to confirm all tests still work" -ForegroundColor Yellow 