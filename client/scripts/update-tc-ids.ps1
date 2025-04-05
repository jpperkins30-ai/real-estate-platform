# Update test case IDs for TC999 files
#
# This script updates test files with TC999 prefixes to use the correct TC IDs
# from the test-plan.json file

Write-Host "Updating TC999 test files with proper test case IDs..." -ForegroundColor Cyan

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

# Component to TC ID mapping
$componentTcMap = @{
    # Layouts
    "DualPanelLayout" = "TC901"
    "TriPanelLayout" = "TC911"
    "QuadPanelLayout" = "TC921"
    "SinglePanelLayout" = "TC931"
    
    # Panels
    "FilterPanel" = "TC1001"
    "CountyPanel" = "TC1101"
    
    # Controllers
    "ControllerWizardLauncher" = "TC1201"
    
    # Hooks
    "useFilter" = "TC1301"
    "usePanelState" = "TC1401"
    "useResizable" = "TC1501"
    "useMaximizable" = "TC1601"
    
    # Context
    "FilterContext" = "TC1701"
    "PanelSyncContext" = "TC1801"
    
    # Advanced hooks
    "useAdvancedLayout" = "TC1901"
    
    # Components
    "DraggablePanel" = "TC2001"
    "PropertySearchBox" = "TC2101"
    
    # Services
    "dbConnection" = "TC2201"
    "filterService" = "TC2301"
    "panelStateService" = "TC2401"
    "propertySearch" = "TC2501"
    
    # Integration
    "PanelIntegration" = "TC2601"
    "PanelCommunication" = "TC2602"
    "FilterSystemIntegration" = "TC2603"
    "integration_ControllerWizardLauncher" = "TC2604"
}

# Find all TC999 test files
$tc999Files = Get-ChildItem -Path $testDir -File | Where-Object { $_.Name -match '^TC999_.+\.test\.(ts|tsx)$' }

Write-Host "Found $($tc999Files.Count) TC999 files to update" -ForegroundColor Yellow

$updatedCount = 0

foreach ($file in $tc999Files) {
    $fileName = $file.Name
    $filePath = $file.FullName
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName) -replace '^TC999_', ''
    $extension = [System.IO.Path]::GetExtension($fileName)
    
    # Determine the correct TC ID based on component name
    $matchedTcId = $null
    
    # Try direct match with component map
    foreach ($component in $componentTcMap.Keys) {
        if ($baseName -match $component) {
            $matchedTcId = $componentTcMap[$component]
            break
        }
    }
    
    # If no match found, keep as TC999
    if ($null -eq $matchedTcId) {
        Write-Host "No matching TC ID found for: $fileName. Keeping as TC999." -ForegroundColor Yellow
        continue
    }
    
    # Create new file name with proper TC ID
    $newFileName = "${matchedTcId}_$baseName$extension"
    $newFilePath = Join-Path (Split-Path $filePath) $newFileName
    
    # Get the test case description from the test plan
    $matchedTC = $testCases | Where-Object { $_.id -eq $matchedTcId } | Select-Object -First 1
    
    if ($null -eq $matchedTC) {
        Write-Host "No matching test case found for ID: $matchedTcId. Skipping." -ForegroundColor Yellow
        continue
    }
    
    # Update the first line comment with the correct test case description
    $content = Get-Content -Path $filePath -Raw
    $lines = $content -split "\r?\n"
    
    if ($lines[0] -match '^// Test Case \d+:') {
        $lines[0] = "// Test Case $($matchedTC.id): $($matchedTC.description)"
        $newContent = $lines -join "`r`n"
        
        # Write updated content
        Set-Content -Path $filePath -Value $newContent
        Write-Host "Updated test case comment in $fileName" -ForegroundColor Green
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
Write-Host "Update complete: $updatedCount files updated, $($tc999Files.Count - $updatedCount) files skipped" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run precommit' to verify the files pass validation" -ForegroundColor Yellow
Write-Host "2. Run 'npm test' to confirm all tests still work" -ForegroundColor Yellow 