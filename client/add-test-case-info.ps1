# add-test-case-info.ps1
# PowerShell script to add test case references to existing test files

Write-Host "Adding test case references to existing test files..." -ForegroundColor Cyan

# Change to the client directory if not already there
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("client")) {
    if (Test-Path ".\client") {
        Set-Location -Path ".\client"
        Write-Host "Changed directory to client folder" -ForegroundColor Yellow
    }
}

# Define the test directory
$testDir = "src\__tests__"

# Ensure the directory exists
if (-not (Test-Path $testDir)) {
    Write-Host "Test directory not found: $testDir" -ForegroundColor Red
    exit 1
}

# Find all test files
$testFiles = Get-ChildItem -Path $testDir -File | Where-Object { $_.Name -match '\.test\.(ts|tsx)$' }

Write-Host "Found $($testFiles.Count) test files" -ForegroundColor Yellow

# Track mapping for documentation
$tcMapping = @()
$tcMapping += "# Test Case Mapping"
$tcMapping += "# Generated on $(Get-Date)"
$tcMapping += ""
$tcMapping += "| Test File | Test Case ID | Test Case Description |"
$tcMapping += "|-----------|--------------|------------------------|"

# Process each test file
foreach ($file in $testFiles) {
    $filePath = $file.FullName
    $fileName = $file.Name
    
    # Check if file already has TC prefix
    if ($fileName -match '^TC\d+_') {
        Write-Host "Skipping $fileName - already has TC prefix" -ForegroundColor Yellow
        # Extract the existing test case ID
        $tcId = $fileName -replace '^TC(\d+)_.*$', '$1'
        
        # Read first line to get description if it exists
        $firstLine = Get-Content -Path $filePath -TotalCount 1
        $tcDesc = if ($firstLine -match '// Test Case \d+: (.+)') {
            $matches[1]
        } else {
            "No description"
        }
        
        $tcMapping += "| $fileName | $tcId | $tcDesc |"
        continue
    }
    
    Write-Host "Processing: $fileName" -ForegroundColor Cyan
    
    # Prompt for test case ID
    $tcId = Read-Host "Enter test case ID for $fileName (or press Enter to skip)"
    
    if ([string]::IsNullOrWhiteSpace($tcId)) {
        Write-Host "Skipping $fileName" -ForegroundColor Yellow
        $tcMapping += "| $fileName | N/A | N/A |"
        continue
    }
    
    # Prompt for test case description
    $tcDesc = Read-Host "Enter test case description"
    
    # New file name with TC prefix
    $newFileName = "TC${tcId}_$fileName"
    $newFilePath = Join-Path (Split-Path $filePath -Parent) $newFileName
    
    # Read file content
    $content = Get-Content -Path $filePath
    
    # Add test case description comment if provided
    if (-not [string]::IsNullOrWhiteSpace($tcDesc)) {
        $comment = "// Test Case ${tcId}: $tcDesc"
        $content = @($comment) + $content
    }
    
    # Write updated content
    $content | Set-Content -Path $filePath
    
    # Rename file
    Rename-Item -Path $filePath -NewName $newFileName
    
    Write-Host "Renamed: $fileName -> $newFileName" -ForegroundColor Green
    $tcMapping += "| $newFileName | $tcId | $tcDesc |"
}

# Save mapping to file
$tcMapping | Out-File -FilePath "test-case-mapping.md" -Force

Write-Host "`nTest case reference addition complete." -ForegroundColor Green
Write-Host "Mapping saved to test-case-mapping.md" -ForegroundColor Green

# Return to original directory if we changed it
if (-not $currentDir.Path.EndsWith("client")) {
    Set-Location -Path $currentDir
} 