# server/scripts/start-server.ps1
Write-Host "Starting the Real Estate Platform server..." -ForegroundColor Green

# Navigate to server directory (get parent of scripts folder)
$serverDir = Join-Path -Path $PSScriptRoot -ChildPath ".." 
$serverDir = Resolve-Path $serverDir
Set-Location -Path $serverDir

Write-Host "Server directory: $serverDir" -ForegroundColor Cyan

# Check if node_modules exists, install if not
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Cyan
}

# Set NODE_PATH environment variable to help with module resolution
$env:NODE_PATH = Join-Path -Path $serverDir -ChildPath "src"
Write-Host "NODE_PATH set to: $env:NODE_PATH" -ForegroundColor Cyan

# Start the development server
try {
    Write-Host "Starting development server..." -ForegroundColor Green
    npm run dev
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    exit 1
} 