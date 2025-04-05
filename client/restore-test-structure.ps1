# restore-test-structure.ps1
# PowerShell script to restore test files to their original structure

Write-Host \"Restoring test directory structure...\" -ForegroundColor Cyan

# Define the root test directory
$rootTestDir = \"src\\__tests__\"

# Ensure the root directory exists
if (-not (Test-Path $rootTestDir)) {
    Write-Host \"Root test directory not found: $rootTestDir\" -ForegroundColor Red
    exit 1
}

# Check if the mapping file exists
$mappingFile = \"test-flattening-map.md\"
if (-not (Test-Path $mappingFile)) {
    Write-Host \"Mapping file not found: $mappingFile\" -ForegroundColor Red
    exit 1
}

# Parse the mapping file
$mappingContent = Get-Content $mappingFile | Select-Object -Skip 6 # Skip header rows
$restored = 0

foreach ($line in $mappingContent) {
    if ($line -match '\\|\\s*(.+?)\\s*\\|\\s*(.+?)\\s*\\|') {
        $originalPath = $matches[1].Trim()
        $newFileName = $matches[2].Trim()
        
        # Only process lines that have valid paths
        if ($originalPath -match 'src\\\\__tests__\\\\(.+)') {
            $currentFilePath = Join-Path $rootTestDir $newFileName
            
            # Check if the flattened file exists
            if (Test-Path $currentFilePath) {
                # Get the directory path
                $dirPath = Split-Path -Parent $originalPath
                
                # Create directory if it doesn't exist
                if (-not (Test-Path $dirPath)) {
                    New-Item -Path $dirPath -ItemType Directory -Force | Out-Null
                    Write-Host \"Created directory: $dirPath\" -ForegroundColor Yellow
                }
                
                # Move the file back to its original location
                Move-Item -Path $currentFilePath -Destination $originalPath -Force
                Write-Host \"Restored file: $newFileName -> $originalPath\" -ForegroundColor Green
                $restored++
            }
        }
    }
}

# Report summary
Write-Host \"`nRestoration complete. Restored $restored files.\" -ForegroundColor Cyan 