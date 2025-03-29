# server-env.ps1
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

# First check and kill any existing process on port 4000
Write-Host "Checking for processes using port 4000..." -ForegroundColor Yellow
$processInfo = netstat -ano | findstr :4000 | findstr LISTENING
    
if ($processInfo) {
    $processInfo | ForEach-Object {
        if ($_ -match "LISTENING\s+(\d+)") {
            $processPid = $matches[1]
            Write-Host "Killing process with PID $processPid using port 4000..." -ForegroundColor Red
            taskkill /F /PID $processPid
        }
    }
} else {
    Write-Host "No process found using port 4000" -ForegroundColor Green
}

# Start the server
Write-Host "Starting server..." -ForegroundColor Green
npm run dev 