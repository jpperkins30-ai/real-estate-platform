Write-Host "Starting Server Only..." -ForegroundColor Green
Write-Host ""

# Navigate to server directory
Set-Location -Path "$PSScriptRoot\server"

# Install dependencies if needed
Write-Host "Installing server dependencies if needed..." -ForegroundColor Cyan
npm install

# Run the server
Write-Host "Starting server..." -ForegroundColor Yellow
npm run dev 