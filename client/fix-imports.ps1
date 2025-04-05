# fix-imports.ps1
# Simple script to fix imports in test files

Write-Host "Fixing import paths in test files..." -ForegroundColor Cyan

# Get all test files
$testFiles = Get-ChildItem -Path "src\__tests__" -File -Filter "*.test.t*"
$count = 0

foreach ($file in $testFiles) {
    $filePath = $file.FullName
    $content = Get-Content -Path $filePath -Raw
    $originalContent = $content
    $fileName = $file.Name
    
    Write-Host "Processing $fileName..." -ForegroundColor Yellow
    
    # Replace src/ with ../../
    $newContent = $content -replace 'from "src/', 'from "../../'
    $newContent = $newContent -replace "vi.mock\('src/", "vi.mock('../../"
    
    # Fix test-utils imports
    $newContent = $newContent -replace 'from "\.\./\.\./test-utils"', 'from "../test-utils"'
    $newContent = $newContent -replace 'from "\.\./\.\./\.\./\.\./test-utils"', 'from "../test-utils"'
    $newContent = $newContent -replace 'from "\.\./\.\./\.\./\.\./test-utils/test-utils"', 'from "../test-utils"'
    
    # Only write the file if changes were made
    if ($newContent -ne $originalContent) {
        Set-Content -Path $filePath -Value $newContent
        Write-Host " - Updated import paths" -ForegroundColor Green
        $count++
    } else {
        Write-Host " - No changes needed" -ForegroundColor DarkGray
    }
}

Write-Host "`nCompleted! Updated import paths in $count files." -ForegroundColor Cyan 