# PowerShell script to start the server in development mode
Write-Host "Starting the server in development mode..."
Set-Location -Path "$PSScriptRoot/server"
npm run dev 