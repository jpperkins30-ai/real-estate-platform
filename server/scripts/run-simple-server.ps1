# server/scripts/run-simple-server.ps1
Write-Host "Starting simple Express server..." -ForegroundColor Green

# Navigate to server directory
$serverDir = Join-Path -Path $PSScriptRoot -ChildPath ".." 
$serverDir = Resolve-Path $serverDir
Set-Location -Path $serverDir

Write-Host "Server directory: $serverDir" -ForegroundColor Cyan

# Make sure dotenv and express are installed
try {
    Write-Host "Checking for required packages..." -ForegroundColor Yellow
    npm list dotenv express mongoose --depth=0
} catch {
    Write-Host "Installing required packages..." -ForegroundColor Yellow
    npm install dotenv express mongoose
}

# Start the simple server
Write-Host "Starting simple server..." -ForegroundColor Green
node src/simple-server.js 