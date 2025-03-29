# PowerShell script to run client and server concurrently
Write-Host "Starting development environment..."

# Function to start the server
function Start-Server {
    Write-Host "Starting server..."
    Set-Location -Path "$PSScriptRoot/server"
    npm run dev
}

# Function to start the client
function Start-Client {
    Write-Host "Starting client..."
    Set-Location -Path "$PSScriptRoot/client"
    npm run dev
}

# Start server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; . './start-server.ps1'"

# Wait a moment for the server to start
Start-Sleep -Seconds 3

# Start client in the current window
Set-Location -Path "$PSScriptRoot/client"
npm run dev 