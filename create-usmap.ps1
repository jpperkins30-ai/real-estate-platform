# PowerShell script to create a US Map document
Write-Host "Creating US Map document..."
Set-Location -Path "$PSScriptRoot/server"
node src/scripts/create-usmap.js 