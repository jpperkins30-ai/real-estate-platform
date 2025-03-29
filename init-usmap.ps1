# PowerShell script to initialize the US Map
Write-Host "Initializing US Map..."

# Set environment variable for standalone execution
$env:STANDALONE = "true"

# Navigate to server directory
Set-Location -Path "$PSScriptRoot/server"

# Run the initialization script with ts-node
npx ts-node -r tsconfig-paths/register --project tsconfig.json src/scripts/initUSMap.ts

Write-Host "US Map initialization complete!" 