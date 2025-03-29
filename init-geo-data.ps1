Write-Host "Initializing Geographic Data..." -ForegroundColor Green
Write-Host ""

# Change directory to server
Set-Location -Path "$PSScriptRoot\server"

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path -Path 'node_modules')) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Set environment variable for geo data initialization
$env:INIT_GEO_DATA = "true"

# Run the initGeoData script directly
Write-Host "Running Geographic Data Initialization..." -ForegroundColor Cyan
npx ts-node src/scripts/initGeoData.ts

Write-Host ""
Write-Host "Geographic Data Initialization Complete!" -ForegroundColor Green
Write-Host "You can now run the application with: .\run-windows-app.ps1" -ForegroundColor Yellow 