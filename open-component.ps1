# Open Real Estate Platform Component in Browser
# This script opens a specific component of the Real Estate Platform in your default browser

param (
    [Parameter()]
    [ValidateSet("inventory", "map", "wizard", "health")]
    [string]$Component = "inventory"
)

# Define component URLs
$componentUrls = @{
    "inventory" = "http://localhost:3000/inventory"
    "map" = "http://localhost:3000/map"
    "wizard" = "http://localhost:3000/wizard"
    "health" = "http://localhost:4000/api/health"
}

# Display selected component
Write-Host "Opening $Component component in browser..." -ForegroundColor Cyan
Write-Host "URL: $($componentUrls[$Component])" -ForegroundColor Yellow

# Open the component in default browser
Start-Process $componentUrls[$Component]

Write-Host "`nUse TESTING-GUIDE.md for comprehensive testing instructions." -ForegroundColor Green

# Usage information
Write-Host "`nUsage: " -ForegroundColor Yellow -NoNewline
Write-Host ".\open-component.ps1 -Component [inventory|map|wizard|health]" -ForegroundColor Gray 