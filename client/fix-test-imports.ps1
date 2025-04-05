# fix-test-imports.ps1
# Script to fix import paths in test files after flattening

Write-Host "Fixing import paths in test files..." -ForegroundColor Cyan

# Get all test files
$testFiles = Get-ChildItem -Path "src\\__tests__" -File -Filter "*.test.t*"
$count = 0

foreach ($file in $testFiles) {
    $filePath = $file.FullName
    $content = Get-Content -Path $filePath -Raw
    $originalContent = $content
    $fileName = $file.Name
    
    Write-Host "Processing $fileName..." -ForegroundColor Yellow
    
    # Fix common path issues
    
    # Pattern: 'src/components/...' -> '../../components/...'
    $newContent = $content -replace 'from [\'\"](src\/[^\'\"]+)[\'\"]\;?', 'from \"../../$1\";'
    
    # Mock pattern: vi.mock('src/components/...') -> vi.mock('../../components/...')
    $newContent = $newContent -replace 'vi\.mock\([\'\"](src\/[^\'\"]+)[\'\"]\,?', 'vi.mock(\"../../$1\",'
    
    # Fix test-utils imports
    $newContent = $newContent -replace 'from [\'\"](\.\.\/){2,}test-utils[\'\"]\;?', 'from \"../test-utils\";'
    $newContent = $newContent -replace 'from [\'\"](\.\.\/){2,}test-utils\/test-utils[\'\"]\;?', 'from \"../test-utils\";'
    
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