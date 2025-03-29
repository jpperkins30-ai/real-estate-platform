# Unified test script for authorization middleware
Write-Host "Testing Real Estate Platform Authorization..." -ForegroundColor Cyan

# Function to test if a path exists
function Test-ScriptPath {
    param (
        [string]$Path
    )
    return Test-Path -Path $Path
}

# Store current directory
$rootDir = $PWD.Path
Write-Host "Project root: $rootDir" -ForegroundColor Cyan

# Determine paths
$serverDir = Join-Path -Path $rootDir -ChildPath "server"
$serverScriptPath = Join-Path -Path $serverDir -ChildPath "src\simple-server.js"
$testScriptPath = Join-Path -Path $serverDir -ChildPath "test-api.ps1"

Write-Host "Checking paths:" -ForegroundColor Yellow
Write-Host "- Server directory: $serverDir"
Write-Host "- Server script: $serverScriptPath"
Write-Host "- Test script: $testScriptPath"

# Verify paths exist
if (-not (Test-ScriptPath -Path $serverDir)) {
    Write-Host "ERROR: Server directory not found at: $serverDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-ScriptPath -Path $serverScriptPath)) {
    Write-Host "ERROR: Server script not found at: $serverScriptPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-ScriptPath -Path $testScriptPath)) {
    Write-Host "ERROR: Test script not found at: $testScriptPath" -ForegroundColor Red
    exit 1
}

# Start the simple server in a new PowerShell window
Write-Host "`nStarting server in a new window..." -ForegroundColor Green
$serverCommand = "cd '$serverDir'; node src/simple-server.js"
Start-Process powershell -ArgumentList "-NoExit -Command $serverCommand"

# Wait for server to start
Write-Host "Waiting for server to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run the test script
Write-Host "`nRunning authorization tests..." -ForegroundColor Green
Set-Location -Path $serverDir
& $testScriptPath

# Return to original directory
Set-Location -Path $rootDir

Write-Host "`nTest completed. Please close the server window when done." -ForegroundColor Cyan 