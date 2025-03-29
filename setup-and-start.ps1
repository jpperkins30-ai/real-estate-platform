# PowerShell script to run all setup steps and start the server
Write-Host "Setting up and starting the Real Estate Platform server..."

# Get the absolute path to the server directory
$serverPath = Join-Path -Path $PSScriptRoot -ChildPath "server"

# Change to the server directory
Set-Location -Path $serverPath

# Step 1: Install dependencies if node_modules doesn't exist
if (-not (Test-Path -Path (Join-Path -Path $serverPath -ChildPath "node_modules"))) {
    Write-Host "Installing dependencies..."
    npm install
}

# Step 2: Initialize the US Map document
Write-Host "Initializing US Map document..."
$env:NODE_PATH = Join-Path -Path $serverPath -ChildPath "src"
$env:STANDALONE = "true"
node src/scripts/create-usmap.js

# Step 3: Start the server in JavaScript mode
Write-Host "Starting the server in JavaScript mode..."
npm run dev:js 