# Script to fix mismatched quotes in import statements of test files

# Change to client directory
Set-Location -Path ".\client" -ErrorAction SilentlyContinue
if (-not $?) {
    Write-Host "Error: Could not navigate to client directory. Make sure you're running this from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "Fixing mismatched quotes in test files..." -ForegroundColor Cyan

# Get all test files
$testFiles = Get-ChildItem -Path ".\src\_tests_\*.test.ts*" -Recurse

# Function to fix a file's import quotes
function Fix-ImportQuotes {
    param (
        [string]$filePath
    )
    
    $fileName = Split-Path -Leaf $filePath
    Write-Host "Fixing quotes in $fileName..." -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content -Path $filePath -Raw
    $originalContent = $content
    
    # Replace mixed quotes (double quote at start, single quote at end)
    $content = $content -replace 'from \"(.*?)''', 'from "$1"'
    
    # Replace mixed quotes (single quote at start, double quote at end)
    $content = $content -replace 'from ''(.*?)\"', 'from "$1"'
    
    # Fix specific paths with mismatched quotes
    $content = $content -replace 'from \"\.\.\/hooks\/(\w+)''', 'from "../hooks/$1"'
    $content = $content -replace 'from \"\.\.\/services\/(\w+)''', 'from "../services/$1"'
    $content = $content -replace 'from \"\.\.\/components\/(\w+)''', 'from "../components/$1"'
    $content = $content -replace 'from \"\.\.\/context\/(\w+)''', 'from "../context/$1"'
    
    # Save the updated content back to the file
    if ($content -ne $originalContent) {
        $content | Set-Content -Path $filePath -NoNewline
        Write-Host "  Fixed quotes in $fileName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  No quote issues found in $fileName" -ForegroundColor Gray
        return $false
    }
}

# Track statistics
$totalFiles = $testFiles.Count
$updatedFiles = 0

# Process each test file
foreach ($file in $testFiles) {
    $updated = Fix-ImportQuotes -filePath $file.FullName
    if ($updated) {
        $updatedFiles++
    }
}

Write-Host ""
Write-Host "Quote fixing complete!" -ForegroundColor Cyan
Write-Host "Updated $updatedFiles out of $totalFiles test files." -ForegroundColor Cyan
Write-Host "Now try running the tests again with: npx vitest run" -ForegroundColor Cyan

# Return to the original directory
Set-Location -Path ".." 