Write-Host "Starting the server with proper PowerShell syntax..." -ForegroundColor Green

# Change directory to server first
Set-Location -Path "$PSScriptRoot\server"

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path -Path 'node_modules')) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Run the dev script
Write-Host "Starting server..." -ForegroundColor Cyan
npm run dev 