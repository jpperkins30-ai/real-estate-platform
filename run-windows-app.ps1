Write-Host "Starting Real Estate Platform..." -ForegroundColor Green
Write-Host ""

# Create function for checking MongoDB connection
function Test-MongoDB {
    try {
        # Simple test to check if MongoDB is running
        $mongoStatus = mongod --version
        return $true
    }
    catch {
        Write-Host "MongoDB does not appear to be running!" -ForegroundColor Red
        Write-Host "Please start MongoDB before running the application." -ForegroundColor Yellow
        return $false
    }
}

# Check MongoDB connection
$mongoRunning = Test-MongoDB
if (-not $mongoRunning) {
    Write-Host "Attempting to start MongoDB..."
    try {
        Start-Service MongoDB
        Write-Host "MongoDB service started successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to start MongoDB service. Please start it manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host "======================================"
Write-Host "Step 1: Starting the backend server" -ForegroundColor Cyan
Write-Host "======================================"

# First make sure we're in the root directory
Set-Location -Path $PSScriptRoot

# Check if server node_modules exists
if (-not (Test-Path -Path "server/node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    Set-Location -Path "server"
    npm install
    Set-Location -Path $PSScriptRoot
}

# Start the server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$PSScriptRoot\server'; npm run dev"
Write-Host "Server starting on http://localhost:4000"
Write-Host ""

Start-Sleep -Seconds 5

Write-Host "======================================"
Write-Host "Step 2: Starting the frontend client" -ForegroundColor Cyan
Write-Host "======================================"

# Check if client node_modules exists
if (-not (Test-Path -Path "client/node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    Set-Location -Path "client"
    npm install
    Set-Location -Path $PSScriptRoot
}

# Start the client in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$PSScriptRoot\client'; npm run dev"
Write-Host "Client starting on http://localhost:5173"
Write-Host ""

Write-Host "======================================"
Write-Host "Application URLs:" -ForegroundColor Yellow
Write-Host "======================================"
Write-Host "Backend API: http://localhost:4000"
Write-Host "Frontend UI: http://localhost:5173"
Write-Host "Swagger API Docs: http://localhost:4000/api-docs"
Write-Host ""

Write-Host "Application started successfully!" -ForegroundColor Green
Write-Host "To stop the application, close the PowerShell windows." -ForegroundColor Yellow 