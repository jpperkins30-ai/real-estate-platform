Write-Host "Initializing Database with Geographic Data..." -ForegroundColor Green
Write-Host ""

# Change directory to server
Set-Location -Path "$PSScriptRoot\server"

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path -Path 'node_modules')) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Run the initialization script
Write-Host "Running Data Initialization Script..." -ForegroundColor Cyan
npx ts-node src/scripts/createInitialData.ts

Write-Host ""
Write-Host "Database Initialization Complete!" -ForegroundColor Green
Write-Host "You can now run the application with: .\run-powershell.ps1" -ForegroundColor Yellow 