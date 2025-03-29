# Simple script to run the Real Estate Platform
Write-Host "Starting Real Estate Platform..." -ForegroundColor Green

# Get the current directory
$rootDir = Get-Location

# Check if server directory exists
$serverDir = Join-Path -Path $rootDir -ChildPath "server"
if (-not (Test-Path -Path $serverDir -PathType Container)) {
    Write-Host "Error: Server directory not found at $serverDir" -ForegroundColor Red
    exit 1
}

# Check if client directory exists
$clientDir = Join-Path -Path $rootDir -ChildPath "client"
if (-not (Test-Path -Path $clientDir -PathType Container)) {
    Write-Host "Error: Client directory not found at $clientDir" -ForegroundColor Red
    exit 1
}

# Start the server in a new window
Write-Host "Starting server..." -ForegroundColor Yellow
$serverCommand = "Set-Location -Path '$serverDir'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverCommand

# Give the server time to start
Write-Host "Waiting for server to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start the client in a new window
Write-Host "Starting client..." -ForegroundColor Yellow
$clientCommand = "Set-Location -Path '$clientDir'; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $clientCommand

Write-Host "Application started in separate windows!" -ForegroundColor Green

Write-Host "======================================"
Write-Host "Application URLs:" -ForegroundColor Yellow
Write-Host "======================================"
Write-Host "Backend API: http://localhost:4000"
Write-Host "Frontend UI: http://localhost:5173"
Write-Host "Swagger API Docs: http://localhost:4000/api-docs"
Write-Host ""

Write-Host "Application started successfully!" -ForegroundColor Green
Write-Host "To stop the application, close the PowerShell windows." -ForegroundColor Yellow 