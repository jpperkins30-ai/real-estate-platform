# server/scripts/create-usmap.ps1
Write-Host "Initializing US Map document..." -ForegroundColor Green

# Navigate to server directory (get parent of scripts folder)
$serverDir = Join-Path -Path $PSScriptRoot -ChildPath ".." 
$serverDir = Resolve-Path $serverDir
Set-Location -Path $serverDir

Write-Host "Server directory: $serverDir" -ForegroundColor Cyan

# Set environment variables
$env:NODE_PATH = Join-Path -Path $serverDir -ChildPath "src"
$env:STANDALONE = "true"

# Run the script to create the USMap
try {
    Write-Host "Creating US Map..." -ForegroundColor Yellow
    node src/scripts/create-usmap.js
    Write-Host "US Map creation completed successfully." -ForegroundColor Green
} catch {
    Write-Host "Error creating US Map: $_" -ForegroundColor Red
    exit 1
} 