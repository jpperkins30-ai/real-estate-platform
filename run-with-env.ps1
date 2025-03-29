# run-with-env.ps1
Write-Host "Setting environment variables and starting server..." -ForegroundColor Green

# Explicitly set JWT_SECRET environment variable
$env:JWT_SECRET = "secure-jwt-secret-for-development-only"
$env:PORT = "4000"
$env:NODE_ENV = "development"
$env:MONGODB_URI = "mongodb://localhost:27017/real-estate-platform"

# Display current environment variables
Write-Host "Current environment variables:" -ForegroundColor Cyan
Write-Host "JWT_SECRET: [SET]" -ForegroundColor Yellow
Write-Host "PORT: $($env:PORT)" -ForegroundColor Yellow
Write-Host "NODE_ENV: $($env:NODE_ENV)" -ForegroundColor Yellow
Write-Host "MONGODB_URI: $($env:MONGODB_URI)" -ForegroundColor Yellow

# Navigate to server directory
Set-Location -Path "server"

# Start the server
Write-Host "Starting server..." -ForegroundColor Green
npm run dev 