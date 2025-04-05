# flatten-tests.ps1
# PowerShell script to move nested test files to the parent directory

Write-Host "Flattening test directory structure..." -ForegroundColor Cyan

# Change to the client directory if not already there
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("client")) {
    if (Test-Path ".\client") {
        Set-Location -Path ".\client"
        Write-Host "Changed directory to client folder" -ForegroundColor Yellow
    }
}

# Define the root test directory
$rootTestDir = "src\__tests__"

# Ensure the root directory exists
if (-not (Test-Path $rootTestDir)) {
    Write-Host "Root test directory not found: $rootTestDir" -ForegroundColor Red
    exit 1
}

# Find all .test.ts and .test.tsx files in subdirectories
$testFiles = Get-ChildItem -Path $rootTestDir -Recurse -File | Where-Object { $_.Name -match '\.test\.(ts|tsx)$' -and $_.DirectoryName -ne (Resolve-Path $rootTestDir).Path }

Write-Host "Found $($testFiles.Count) test files in subdirectories" -ForegroundColor Yellow

# Dictionary to track renamed files to avoid conflicts
$fileNameMap = @{}

# Prompt user if they want to add test case references
$addTestCaseRefs = Read-Host "Do you want to add test case references to file names? (y/n)"
$addTestCaseRefs = $addTestCaseRefs.ToLower() -eq 'y'

# Process each test file
foreach ($file in $testFiles) {
    $sourcePath = $file.FullName
    $relativePath = $file.DirectoryName -replace [regex]::Escape((Resolve-Path $rootTestDir).Path + "\"), ""
    $originalFileName = $file.Name
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($originalFileName)
    $extension = [System.IO.Path]::GetExtension($originalFileName)
    
    # Create new file name with directory prefix to ensure uniqueness
    $newFileNameBase = if ($relativePath) {
        # Create a flattened name based on the path
        ($relativePath -replace "\\", "_") + "_" + $nameWithoutExt
    } else {
        $nameWithoutExt
    }
    
    if ($addTestCaseRefs) {
        # Prompt for test case ID
        Write-Host "Processing: $relativePath\$originalFileName" -ForegroundColor Cyan
        $testCaseId = Read-Host "Enter test case ID/reference (or press Enter to skip)"
        
        if (-not [string]::IsNullOrWhiteSpace($testCaseId)) {
            $newFileNameBase = "TC${testCaseId}_${newFileNameBase}"
        }
    }
    
    $newFileName = "${newFileNameBase}${extension}"
    
    # Handle name collisions
    if ($fileNameMap.ContainsKey($newFileName)) {
        $count = 1
        
        while ($fileNameMap.ContainsKey("${newFileNameBase}_${count}${extension}")) {
            $count++
        }
        
        $newFileName = "${newFileNameBase}_${count}${extension}"
    }
    
    $destPath = Join-Path (Resolve-Path $rootTestDir).Path $newFileName
    
    Write-Host "Moving: $sourcePath" -ForegroundColor Cyan
    Write-Host "   To: $destPath" -ForegroundColor Green
    
    # Store the mapping for reference
    $fileNameMap[$newFileName] = $sourcePath
    
    # Move the file
    Move-Item -Path $sourcePath -Destination $destPath -Force
}

# Check for empty subdirectories and remove them
$emptyDirs = Get-ChildItem -Path $rootTestDir -Directory -Recurse | 
    Where-Object { 
        (Get-ChildItem -Path $_.FullName -Recurse -File).Count -eq 0 
    } | 
    Sort-Object -Property FullName -Descending # Process deepest directories first

if ($emptyDirs.Count -gt 0) {
    Write-Host "`nRemoving empty directories:" -ForegroundColor Yellow
    foreach ($dir in $emptyDirs) {
        $relativePath = $dir.FullName -replace [regex]::Escape((Get-Location)), ""
        $relativePath = $relativePath.TrimStart("\")
        Write-Host "- $relativePath" -ForegroundColor Yellow
        
        Remove-Item -Path $dir.FullName -Force
    }
}

# Generate a mapping file for reference
$mappingOutput = @()
$mappingOutput += "# Test File Mapping"
$mappingOutput += "# Generated on $(Get-Date)"
$mappingOutput += ""
$mappingOutput += "| Original Path | New File Name | Test Case Reference |"
$mappingOutput += "|---------------|--------------|---------------------|"

foreach ($key in $fileNameMap.Keys) {
    $value = $fileNameMap[$key]
    $relativePath = $value -replace [regex]::Escape((Get-Location)), ""
    $relativePath = $relativePath.TrimStart("\")
    
    # Extract test case ID if present
    $testCaseId = if ($key -match '^TC(\d+)_') { $matches[1] } else { "" }
    
    $mappingOutput += "| $relativePath | $key | $testCaseId |"
}

$mappingOutput | Out-File -FilePath "test-flattening-map.md" -Force

Write-Host "`nTest flattening complete." -ForegroundColor Green
Write-Host "Mapping saved to test-flattening-map.md" -ForegroundColor Green

# Return to original directory if we changed it
if (-not $currentDir.Path.EndsWith("client")) {
    Set-Location -Path $currentDir
} 