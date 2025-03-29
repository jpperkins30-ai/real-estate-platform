# Start a simple test server with authorization middleware
Write-Host "Starting test server with authorization middleware..." -ForegroundColor Cyan

# Set absolute paths
$rootDir = $PWD.Path
$serverDir = Join-Path -Path $rootDir -ChildPath "server"
$simpleServerPath = Join-Path -Path $serverDir -ChildPath "src\simple-server.js"

# Verify paths
Write-Host "Checking paths..." -ForegroundColor Yellow
Write-Host "- Server directory: $serverDir"
Write-Host "- Simple server script: $simpleServerPath"

if (-not (Test-Path -Path $serverDir)) {
    Write-Host "ERROR: Server directory not found at: $serverDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path -Path $simpleServerPath)) {
    Write-Host "ERROR: Simple server script not found at: $simpleServerPath" -ForegroundColor Red
    exit 1
}

# Start the server
Write-Host "`nStarting simple server..." -ForegroundColor Green
Set-Location -Path $serverDir
node src/simple-server.js 