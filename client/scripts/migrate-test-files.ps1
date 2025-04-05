# Migrate test files to the standardized structure
#
# This script finds all test files in subdirectories and moves them to the root __tests__ directory
# with proper TC IDs and comment headers

Write-Host \"Migrating test files to standardized structure...\" -ForegroundColor Cyan

# Paths
$testDir = \"src\\__tests__\"
$testPlanPath = \"test-plan.json\"

# Ensure the directories exist
if (-not (Test-Path $testDir)) {
    Write-Host \"Test directory not found: $testDir\" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $testPlanPath)) {
    Write-Host \"Test plan not found: $testPlanPath\" -ForegroundColor Red
    exit 1
}

# Load test plan
$testPlan = Get-Content -Path $testPlanPath -Raw | ConvertFrom-Json
$testCases = $testPlan.testCases

# Mapping of component types to TC ID prefixes
$componentPrefixMap = @{
    'LayoutSelector' = 'TC1'
    'MultiFrameContainer' = 'TC2'
    'PanelContentRegistry' = 'TC3'
    'AdvancedLayout' = 'TC4'
    'EnhancedMultiFrameContainer' = 'TC5'
    'useDraggable' = 'TC6'
    'PanelContainer' = 'TC7'
    'PanelHeader' = 'TC8'
}

# Find all test files in subdirectories
$testFiles = Get-ChildItem -Path $testDir -Recurse | Where-Object { ($_.Name -match '\\.test\\.(ts|tsx)$') -and ($_.DirectoryName -ne (Resolve-Path $testDir).Path) }

Write-Host \"Found $($testFiles.Count) test files in subdirectories\" -ForegroundColor Yellow

$migratedCount = 0

foreach ($file in $testFiles) {
    $fileName = $file.Name
    $filePath = $file.FullName
    $relativePath = $filePath.Substring((Resolve-Path $testDir).Path.Length + 1)
    
    # Determine the component name from the file name
    $componentName = [System.IO.Path]::GetFileNameWithoutExtension($fileName) -replace '\\.test$', ''
    
    # Find matching test case in test plan
    $matchedTC = $null
    foreach ($tc in $testCases) {
        # Look for test case descriptions that mention the component name
        if ($tc.description -like \"*$componentName*\") {
            $matchedTC = $tc
            break
        }
    }
    
    # If no direct match, try to match based on prefix
    if ($null -eq $matchedTC) {
        foreach ($prefix in $componentPrefixMap.Keys) {
            if ($componentName -like \"*$prefix*\") {
                # Find first available test case with the matching prefix
                $tcPrefix = $componentPrefixMap[$prefix]
                $matchedTC = $testCases | Where-Object { $_.id -like \"$tcPrefix*\" } | Select-Object -First 1
                break
            }
        }
    }
    
    # If still no match, assign a generic test case
    if ($null -eq $matchedTC) {
        $matchedTC = @{
            id = \"TC999\"
            description = \"Verify $componentName functionality\"
        }
    }
    
    # Read file content
    $content = Get-Content -Path $filePath -Raw
    
    # Check if first line already has a comment
    $lines = $content -split \"\r?\n\"
    $hasComment = $lines[0] -match '^//'
    
    # Determine new content
    $newContent = $content
    if (-not $hasComment) {
        $testCaseComment = \"// Test Case $($matchedTC.id): $($matchedTC.description)\"
        $newContent = \"$testCaseComment`r`n$content\"
    }
    
    # Create new file name with TC prefix
    $extension = [System.IO.Path]::GetExtension($fileName)
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    if (-not ($baseName -match '^TC\\d+_')) {
        $baseName = \"$($matchedTC.id)_$baseName\"
    }
    
    # Determine new paths based on directory structure
    $dirParts = $relativePath.Split([IO.Path]::DirectorySeparatorChar)
    $newBaseName = $baseName
    
    # Add directory parts to filename using underscores
    if ($dirParts.Length -gt 1) {
        $dirPath = $dirParts[0..($dirParts.Length-2)] -join '_'
        $newBaseName = \"$dirPath`_$baseName\"
    }
    
    $newFileName = \"$newBaseName$extension\"
    $newFilePath = Join-Path (Resolve-Path $testDir).Path $newFileName
    
    # Write the new file with updated content
    try {
        Set-Content -Path $newFilePath -Value $newContent
        Write-Host \"Migrated: $relativePath -> $newFileName\" -ForegroundColor Green
        $migratedCount++
    } catch {
        Write-Host \"Error migrating file $relativePath: $_\" -ForegroundColor Red
    }
}

# Display results
Write-Host \"\"
Write-Host \"Migration complete: $migratedCount files migrated to root test directory\" -ForegroundColor Cyan
Write-Host \"\"
Write-Host \"Next steps:\" -ForegroundColor Yellow
Write-Host \"1. Verify that all test files work correctly\" -ForegroundColor Yellow
Write-Host \"2. Run 'npm test' to confirm test compatibility\" -ForegroundColor Yellow
Write-Host \"3. Delete the original test files in subdirectories if all tests pass\" -ForegroundColor Yellow 