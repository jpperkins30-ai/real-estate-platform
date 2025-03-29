# Simplified component check script
Write-Host "Manual Component Check for Real Estate Platform" -ForegroundColor Cyan

# Component URLs to test
$componentUrls = @{
    "Server Health Check" = "http://localhost:4000/api/health"
    "Inventory Dashboard" = "http://localhost:3000/inventory"
    "US Map View" = "http://localhost:3000/map"
    "Collector Wizard" = "http://localhost:3000/wizard"
    "Property Details" = "http://localhost:3000/inventory/properties"
}

# Display the URLs for manual verification
Write-Host "`nComponent URLs to check manually:" -ForegroundColor Yellow
foreach ($component in $componentUrls.Keys) {
    $url = $componentUrls[$component]
    Write-Host "$component : $url" -ForegroundColor Cyan
}

Write-Host "`nManual Testing Instructions:" -ForegroundColor Magenta
Write-Host "1. Make sure both server and client are running using .\start-app-direct.ps1"
Write-Host "2. Open a web browser and navigate to each URL"
Write-Host "3. Verify the component loads correctly" 
Write-Host "4. Follow the testing guide in component-test-guide.md for comprehensive testing"

# Ask if user wants to open any URL in browser
Write-Host "`nWould you like to open any component in the browser? (y/n)" -ForegroundColor Yellow
$openBrowser = Read-Host

if ($openBrowser -eq "y") {
    Write-Host "`nWhich component? (health/inventory/map/wizard/properties)" -ForegroundColor Yellow
    $selection = Read-Host
    
    switch ($selection.ToLower()) {
        "health" { Start-Process $componentUrls["Server Health Check"] }
        "inventory" { Start-Process $componentUrls["Inventory Dashboard"] }
        "map" { Start-Process $componentUrls["US Map View"] }
        "wizard" { Start-Process $componentUrls["Collector Wizard"] }
        "properties" { Start-Process $componentUrls["Property Details"] }
        default { Write-Host "Invalid selection" -ForegroundColor Red }
    }
}

# Server API endpoints to check
Write-Host "`nServer API endpoints to check (require admin token):" -ForegroundColor Yellow
$apiEndpoints = @(
    "http://localhost:4000/api/inventory/properties",
    "http://localhost:4000/api/usmap",
    "http://localhost:4000/api/wizard/steps"
)

foreach ($endpoint in $apiEndpoints) {
    Write-Host "API Endpoint: $endpoint" -ForegroundColor Cyan
}

Write-Host "`nPlease refer to component-test-guide.md for detailed testing steps." -ForegroundColor Cyan 