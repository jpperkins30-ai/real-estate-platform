# Flatten test directory structure and add TC IDs
#
# This script flattens the server test directory structure to match the client
# and adds proper test case IDs to the server test files

Write-Host "Flattening server test directory structure..." -ForegroundColor Cyan

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

# Direct mapping of test files to TC IDs - using more specific paths
$fileToTcMap = @{
    "LayoutConfig.test.ts" = "TC3001"
    "UserPreferences.test.ts" = "TC3101"
    "layoutController.test.ts" = "TC3201"
}

# Find all test files in subdirectories
$testFiles = Get-ChildItem -Path $testDir -Recurse -File | Where-Object { 
    ($_.Name -match '\.test\.(ts|tsx)$') -and ($_.DirectoryName -ne (Resolve-Path $testDir).Path) 
}

Write-Host "Found $($testFiles.Count) test files in subdirectories" -ForegroundColor Yellow

$migratedCount = 0

foreach ($file in $testFiles) {
    $fileName = $file.Name
    $filePath = $file.FullName
    
    # Determine TC ID based on file name
    $tcId = $null
    if ($fileToTcMap.ContainsKey($fileName)) {
        $tcId = $fileToTcMap[$fileName]
    }
    
    if ($null -eq $tcId) {
        Write-Host "No TC ID mapping found for $fileName. Skipping." -ForegroundColor Yellow
        continue
    }
    
    # Get test case from test plan
    $testCase = $testCases | Where-Object { $_.id -eq $tcId } | Select-Object -First 1
    
    if ($null -eq $testCase) {
        Write-Host "No test case found for TC ID: $tcId. Skipping." -ForegroundColor Yellow
        continue
    }
    
    # Read file content
    $content = Get-Content -Path $filePath -Raw
    $lines = $content -split "\r?\n"
    
    # Create new file name with TC prefix
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    $extension = [System.IO.Path]::GetExtension($fileName)
    $dirName = Split-Path -Leaf (Split-Path -Parent $filePath)
    
    $newBaseName = "${dirName}_$baseName"
    $newFileName = "${tcId}_$newBaseName$extension"
    $newFilePath = Join-Path (Resolve-Path $testDir).Path $newFileName
    
    # Add TC ID comment at the top of the file
    $tcNumber = $tcId -replace 'TC', ''
    $commentLine = "// Test Case $tcNumber`: $($testCase.description)"
    $newContent = "$commentLine`r`n$content"
    
    # Create the new file in the root test directory
    Set-Content -Path $newFilePath -Value $newContent
    Write-Host "Created: $newFileName with correct TC ID" -ForegroundColor Green
    
    # Delete the original file after copying
    Remove-Item -Path $filePath
    Write-Host "Removed original file: $fileName" -ForegroundColor Yellow
    
    $migratedCount++
}

# Check for empty directories and remove them
$subdirs = Get-ChildItem -Path $testDir -Directory
foreach ($dir in $subdirs) {
    $files = Get-ChildItem -Path $dir.FullName -Recurse -File
    if ($files.Count -eq 0) {
        Remove-Item -Path $dir.FullName -Recurse
        Write-Host "Removed empty directory: $($dir.Name)" -ForegroundColor Yellow
    }
}

# Display results
Write-Host ""
Write-Host "Migration complete: $migratedCount files migrated to root test directory" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update pre-commit script to include server tests" -ForegroundColor Yellow
Write-Host "2. Run tests to verify functionality" -ForegroundColor Yellow 