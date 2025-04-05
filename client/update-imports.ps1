# update-imports.ps1
# Script to update import paths in flattened test files

Write-Host "Updating import paths in test files..." -ForegroundColor Cyan

# Get all test files
$testFiles = Get-ChildItem -Path "src\__tests__" -File -Filter "*.test.t*"
$count = 0

foreach ($file in $testFiles) {
    $filePath = $file.FullName
    $content = Get-Content -Path $filePath -Raw
    $originalContent = $content
    $fileName = $file.Name
    
    Write-Host "Processing $fileName..." -ForegroundColor Yellow
    
    # Replace relative import paths with absolute paths
    $newContent = $content -replace '\.\.\/(components|services|hooks|context)\/', 'src/$1/'
    $newContent = $newContent -replace '\.\.\/\.\.\/components\/', 'src/components/'
    $newContent = $newContent -replace '\.\.\/\.\.\/services\/', 'src/services/'
    $newContent = $newContent -replace '\.\.\/\.\.\/hooks\/', 'src/hooks/'
    $newContent = $newContent -replace '\.\.\/\.\.\/context\/', 'src/context/'
    $newContent = $newContent -replace '\.\.\/\.\.\/test-utils', 'src/test-utils'
    
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