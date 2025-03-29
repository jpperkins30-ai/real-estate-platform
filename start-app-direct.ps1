# Direct script to start the Real Estate Platform
Write-Host "Starting Real Estate Platform..." -ForegroundColor Cyan

# Using absolute paths to avoid directory navigation issues
$rootDir = $PWD.Path
$serverDir = Join-Path -Path $rootDir -ChildPath "server"
$clientDir = Join-Path -Path $rootDir -ChildPath "client"

Write-Host "Project paths:" -ForegroundColor Yellow
Write-Host "- Root: $rootDir"
Write-Host "- Server: $serverDir"
Write-Host "- Client: $clientDir"

# Verify server directory exists
if (-not (Test-Path -Path $serverDir)) {
    Write-Host "ERROR: Server directory not found at: $serverDir" -ForegroundColor Red
    exit 1
}

# Verify client directory exists
if (-not (Test-Path -Path $clientDir)) {
    Write-Host "ERROR: Client directory not found at: $clientDir" -ForegroundColor Red
    exit 1
}

# Verify server script exists
$serverIndexPath = Join-Path -Path $serverDir -ChildPath "src\index.js"
if (-not (Test-Path -Path $serverIndexPath)) {
    Write-Host "WARNING: Server index.js not found at: $serverIndexPath" -ForegroundColor Yellow
    $serverIndexPath = Join-Path -Path $serverDir -ChildPath "src\index.ts"
    if (-not (Test-Path -Path $serverIndexPath)) {
        Write-Host "ERROR: Server index.ts not found at: $serverIndexPath" -ForegroundColor Red
        exit 1
    }
}

# Verify client exists
$clientPackageJson = Join-Path -Path $clientDir -ChildPath "package.json"
if (-not (Test-Path -Path $clientPackageJson)) {
    Write-Host "ERROR: Client package.json not found at: $clientPackageJson" -ForegroundColor Red
    exit 1
}

# Start the server in a new window
Write-Host "`nStarting server..." -ForegroundColor Green
$serverCmd = "Set-Location -Path '$serverDir'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverCmd

# Wait for server to initialize
Write-Host "Waiting for server to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start the client in a new window
Write-Host "`nStarting client..." -ForegroundColor Green
$clientCmd = "Set-Location -Path '$clientDir'; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $clientCmd

Write-Host "`nApplication started in separate windows." -ForegroundColor Cyan
Write-Host "Close the PowerShell windows when finished." -ForegroundColor Yellow 