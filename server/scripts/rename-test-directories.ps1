# Rename non-test directories to clarify their purpose
#
# This script renames the _tests_ directory (which contains example code)
# to a more descriptive name to avoid confusion with the actual __tests__ directory

Write-Host "Renaming test directories to improve clarity..." -ForegroundColor Cyan

# Paths
$exampleDir = "src/_tests_"
$newDirName = "examples"
$targetDir = "src/$newDirName"

# Ensure the source directory exists
if (-not (Test-Path $exampleDir)) {
    Write-Host "Example directory not found: $exampleDir" -ForegroundColor Red
    exit 1
}

# Check if target directory already exists
if (Test-Path $targetDir) {
    Write-Host "Target directory already exists: $targetDir" -ForegroundColor Yellow
    
    # Prompt user to confirm merge
    $confirmation = Read-Host "Do you want to merge the contents? (y/n)"
    if ($confirmation -ne 'y') {
        Write-Host "Operation cancelled by user." -ForegroundColor Yellow
        exit 0
    }
    
    # Move files instead of renaming the directory
    $files = Get-ChildItem -Path $exampleDir -File
    foreach ($file in $files) {
        $targetPath = Join-Path $targetDir $file.Name
        if (Test-Path $targetPath) {
            Write-Host "File already exists in target: $($file.Name). Skipping." -ForegroundColor Yellow
        } else {
            Move-Item -Path $file.FullName -Destination $targetDir
            Write-Host "Moved: $($file.Name) to $targetDir" -ForegroundColor Green
        }
    }
    
    # Remove original directory if empty
    $remainingFiles = Get-ChildItem -Path $exampleDir
    if ($remainingFiles.Count -eq 0) {
        Remove-Item -Path $exampleDir
        Write-Host "Removed empty directory: $exampleDir" -ForegroundColor Green
    }
} else {
    # Create the parent directory path first
    $parentDir = Split-Path -Parent $targetDir
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }
    
    # Use Move-Item instead of Rename-Item to avoid path issues
    $sourceDir = Resolve-Path $exampleDir
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    
    # Move all files from source to target
    $files = Get-ChildItem -Path $sourceDir -File
    foreach ($file in $files) {
        Move-Item -Path $file.FullName -Destination $targetDir
        Write-Host "Moved: $($file.Name) to $targetDir" -ForegroundColor Green
    }
    
    # Remove original directory
    Remove-Item -Path $sourceDir -Force -Recurse
    Write-Host "Removed original directory: $exampleDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "Directory structure updated!" -ForegroundColor Cyan
Write-Host "The example code files are now in the 'examples' directory." -ForegroundColor Green 