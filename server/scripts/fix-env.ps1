# server/scripts/fix-env.ps1
Write-Host "Checking and fixing environment variables..." -ForegroundColor Green

# Navigate to server directory
$serverDir = Join-Path -Path $PSScriptRoot -ChildPath ".." 
$serverDir = Resolve-Path $serverDir
Set-Location -Path $serverDir

# Create .env file if it doesn't exist
$envFile = Join-Path -Path $serverDir -ChildPath ".env"
if (-not (Test-Path -Path $envFile)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/real-estate-platform
JWT_SECRET=development-jwt-secret-should-change-in-production
JWT_EXPIRES_IN=1d
LOG_LEVEL=info
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "Created .env file." -ForegroundColor Green
} else {
    Write-Host ".env file exists. Checking content..." -ForegroundColor Cyan
    $envContent = Get-Content $envFile -Raw
    
    # Check if JWT_SECRET is set
    if (-not ($envContent -match "JWT_SECRET=")) {
        Write-Host "Adding JWT_SECRET to .env file..." -ForegroundColor Yellow
        "JWT_SECRET=development-jwt-secret-should-change-in-production" | Out-File -FilePath $envFile -Append
        Write-Host "Added JWT_SECRET." -ForegroundColor Green
    }
    
    # Check if MONGODB_URI is set
    if (-not ($envContent -match "MONGODB_URI=")) {
        Write-Host "Adding MONGODB_URI to .env file..." -ForegroundColor Yellow
        "MONGODB_URI=mongodb://localhost:27017/real-estate-platform" | Out-File -FilePath $envFile -Append
        Write-Host "Added MONGODB_URI." -ForegroundColor Green
    }
}

# Verify .env file
Write-Host "Current .env file content:" -ForegroundColor Cyan
Get-Content $envFile | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

# Verify MongoDB is running
Write-Host "Checking if MongoDB is running..." -ForegroundColor Yellow
$mongodRunning = $false
try {
    $mongodProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongodProcess) {
        $mongodRunning = $true
        Write-Host "MongoDB is running." -ForegroundColor Green
    } else {
        Write-Host "MongoDB doesn't appear to be running. Please start MongoDB." -ForegroundColor Red
    }
} catch {
    Write-Host "Error checking MongoDB status: $_" -ForegroundColor Red
}

Write-Host "Environment check complete." -ForegroundColor Green 