# PowerShell script to initialize Git and add all files
Write-Host "====================================="
Write-Host "Initializing Git Repository for Real Estate Platform"
Write-Host "====================================="
Write-Host ""

# Initialize Git
Write-Host "Initializing Git repository..."
git init

# Add all files
Write-Host "Adding all files to staging..."
git add .

# Commit changes
Write-Host "Making initial commit..."
git commit -m "Initial commit with all project files"

Write-Host ""
Write-Host "====================================="
Write-Host "Git initialization completed!"
Write-Host "All files have been added and committed."
Write-Host "====================================="

Write-Host "Press any key to continue..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null 