# PowerShell script to start both server and client in development mode
Write-Host "Starting the development environment..."

# Start the server in a new window
Start-Process powershell -ArgumentList "-Command", "cd $PSScriptRoot/server; npm run dev"

# Start the client in the current window
Write-Host "Starting client..."
Set-Location -Path "$PSScriptRoot/client"
npm run dev 