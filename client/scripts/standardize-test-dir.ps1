# Standardize test directory name
#
# This script renames the client __tests__ directory to _tests_
# to match the server-side convention

Write-Host "Standardizing test directory name..." -ForegroundColor Cyan

# Paths
$sourceDir = "src/__tests__"
$targetDir = "src/_tests_"

# Ensure the source directory exists
if (-not (Test-Path $sourceDir)) {
    Write-Host "Source directory not found: $sourceDir" -ForegroundColor Red
    exit 1
}

# Check if target directory already exists
if (Test-Path $targetDir) {
    Write-Host "Target directory already exists: $targetDir" -ForegroundColor Yellow
    Write-Host "This is unusual - you may have both __tests__ and _tests_ directories." -ForegroundColor Yellow
    
    # Prompt user to confirm merge
    $confirmation = Read-Host "Do you want to merge the contents? (y/n)"
    if ($confirmation -ne 'y') {
        Write-Host "Operation cancelled by user." -ForegroundColor Yellow
        exit 0
    }
    
    # Move files from source to target
    $files = Get-ChildItem -Path $sourceDir -File
    foreach ($file in $files) {
        $targetPath = Join-Path $targetDir $file.Name
        if (Test-Path $targetPath) {
            Write-Host "File already exists in target: $($file.Name). Skipping." -ForegroundColor Yellow
        } else {
            Move-Item -Path $file.FullName -Destination $targetDir
            Write-Host "Moved: $($file.Name) to $targetDir" -ForegroundColor Green
        }
    }
    
    # Remove source directory if empty
    $remainingFiles = Get-ChildItem -Path $sourceDir
    if ($remainingFiles.Count -eq 0) {
        Remove-Item -Path $sourceDir -Force
        Write-Host "Removed empty directory: $sourceDir" -ForegroundColor Green
    }
} else {
    # Create the target directory structure
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    
    # Move all files from source to target
    $files = Get-ChildItem -Path $sourceDir -File
    foreach ($file in $files) {
        Move-Item -Path $file.FullName -Destination $targetDir
        Write-Host "Moved: $($file.Name) to $targetDir" -ForegroundColor Green
    }
    
    # Remove source directory
    Remove-Item -Path $sourceDir -Force -Recurse
    Write-Host "Removed original directory: $sourceDir" -ForegroundColor Green
}

# Update package.json if needed
$packageJsonPath = "package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content -Path $packageJsonPath -Raw
    
    # Replace paths in package.json
    $updatedPackageJson = $packageJson -replace "__tests__", "_tests_"
    
    if ($updatedPackageJson -ne $packageJson) {
        Set-Content -Path $packageJsonPath -Value $updatedPackageJson
        Write-Host "Updated test paths in package.json" -ForegroundColor Green
    }
}

# Update vitest.config.ts if needed
$vitestConfigPath = "vitest.config.ts"
if (Test-Path $vitestConfigPath) {
    $vitestConfig = Get-Content -Path $vitestConfigPath -Raw
    
    # Replace paths in vitest config
    $updatedVitestConfig = $vitestConfig -replace "__tests__", "_tests_"
    
    if ($updatedVitestConfig -ne $vitestConfig) {
        Set-Content -Path $vitestConfigPath -Value $updatedVitestConfig
        Write-Host "Updated test paths in vitest.config.ts" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Test directory standardization complete!" -ForegroundColor Cyan
Write-Host "Your test files are now in the '_tests_' directory to match the server structure." -ForegroundColor Green 