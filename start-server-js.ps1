# PowerShell script to start the JavaScript version of the server
Write-Host "Starting the server in JavaScript mode..."

# Get the absolute path to the server directory
$serverPath = Join-Path -Path $PSScriptRoot -ChildPath "server"

# Change to the server directory
Set-Location -Path $serverPath

# Set up NODE_PATH environment variable to help with module resolution
$env:NODE_PATH = Join-Path -Path $serverPath -ChildPath "src"

# Run the server
npm run dev:js 