# cleanup-tests.ps1
# PowerShell script to remove component-level test directories

Write-Host "Cleaning up component-level test directories..." -ForegroundColor Cyan

# Change to the client directory if not already there
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("client")) {
    if (Test-Path ".\client") {
        Set-Location -Path ".\client"
        Write-Host "Changed directory to client folder" -ForegroundColor Yellow
    }
}

# Find all component-level __tests__ directories
$testDirs = Get-ChildItem -Path "src" -Directory -Recurse | 
    Where-Object { $_.Name -eq "__tests__" -and $_.FullName -notlike "*src\__tests__*" } |
    ForEach-Object { $_.FullName }

Write-Host "Found $($testDirs.Count) component-level test directories" -ForegroundColor Yellow

# Confirm with the user
if ($testDirs.Count -gt 0) {
    Write-Host "The following directories will be removed:" -ForegroundColor Red
    foreach ($dir in $testDirs) {
        $relativePath = $dir -replace [regex]::Escape((Get-Location)), ""
        $relativePath = $relativePath.TrimStart("\")
        Write-Host "- $relativePath" -ForegroundColor Red
    }
    
    $confirmation = Read-Host "Are you sure you want to remove these directories? (y/n)"
    
    if ($confirmation -eq 'y') {
        # Remove the directories
        foreach ($dir in $testDirs) {
            $relativePath = $dir -replace [regex]::Escape((Get-Location)), ""
            $relativePath = $relativePath.TrimStart("\")
            Write-Host "Removing: $relativePath" -ForegroundColor Red
            
            Remove-Item -Path $dir -Recurse -Force
        }
        
        Write-Host "All component-level test directories have been removed" -ForegroundColor Green
    } else {
        Write-Host "Operation cancelled" -ForegroundColor Yellow
    }
} else {
    Write-Host "No component-level test directories found" -ForegroundColor Green
}

# Return to original directory if we changed it
if (-not $currentDir.Path.EndsWith("client")) {
    Set-Location -Path $currentDir
} 