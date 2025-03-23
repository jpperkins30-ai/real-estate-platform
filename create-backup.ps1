# PowerShell script to create a Git backup
Write-Host "====================================="
Write-Host "Creating Git Backup for Real Estate Platform"
Write-Host "====================================="
Write-Host ""

# Check if Git is initialized
if (-not (Test-Path -Path ".git")) {
    Write-Host "Initializing Git repository..."
    git init
}

# Check current status
Write-Host "Checking current status..."
git status

# Create a backup branch with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$branchName = "backup-$timestamp"

Write-Host "Creating backup branch: $branchName"
git checkout -b $branchName

# Add all files
Write-Host "Adding all files to staging..."
git add .

# Commit changes
Write-Host "Committing changes..."
git commit -m "Backup created on $timestamp after admin dashboard troubleshooting"

# Return to original branch
Write-Host "Returning to main branch..."
git checkout main -f

Write-Host ""
Write-Host "====================================="
Write-Host "Backup completed successfully!"
Write-Host "Backup branch: $branchName"
Write-Host "To restore this backup, use: git checkout $branchName"
Write-Host "=====================================" 