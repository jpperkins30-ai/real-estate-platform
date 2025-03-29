# Start client script for Windows PowerShell
Write-Host "Starting client..." -ForegroundColor Cyan

# Navigate to client directory (no need if script is run from client directory)
Set-Location -Path $PSScriptRoot

# Install dependencies if needed
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the client
Write-Host "Running npm start..." -ForegroundColor Green
npm start 