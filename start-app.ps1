# start-app.ps1 (in project root)
Write-Host "Starting Real Estate Platform..." -ForegroundColor Cyan

$serverPath = Join-Path -Path $PSScriptRoot -ChildPath "server\start-server.ps1"
$clientPath = Join-Path -Path $PSScriptRoot -ChildPath "client\start-client.ps1"

# Check if scripts exist
if (-not (Test-Path -Path $serverPath)) {
    Write-Error "Server start script not found at: $serverPath"
    exit 1
}

if (-not (Test-Path -Path $clientPath)) {
    Write-Error "Client start script not found at: $clientPath"
    exit 1
}

# Start server in a new PowerShell window
Write-Host "Starting server in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -File `"$serverPath`""

# Wait a moment for server to initialize
Start-Sleep -Seconds 3

# Start client in a new PowerShell window
Write-Host "Starting client in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -File `"$clientPath`""

Write-Host "Both processes started. Check the new PowerShell windows." -ForegroundColor Cyan
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 