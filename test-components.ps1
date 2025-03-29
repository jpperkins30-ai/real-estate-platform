# Test script for Real Estate Platform components
Write-Host "Testing Key Components of Real Estate Platform" -ForegroundColor Cyan

# Function to verify app is running
function Test-AppRunning {
    param (
        [string]$Url
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5
        return $true
    } catch {
        return $false
    }
}

# Define base URLs
$serverUrl = "http://localhost:4000"
$clientUrl = "http://localhost:3000"

# Check if server is running
Write-Host "`nChecking if server is running..." -ForegroundColor Yellow
$serverRunning = Test-AppRunning -Url "$serverUrl/api/health"
if ($serverRunning) {
    Write-Host "✅ Server is running at $serverUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Server is not running at $serverUrl" -ForegroundColor Red
    Write-Host "Please start the server first with: .\start-app-direct.ps1" -ForegroundColor Yellow
    exit 1
}

# Check if client is running
Write-Host "`nChecking if client is running..." -ForegroundColor Yellow
$clientRunning = Test-AppRunning -Url $clientUrl
if ($clientRunning) {
    Write-Host "✅ Client is running at $clientUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Client is not running at $clientUrl" -ForegroundColor Red
    Write-Host "Please start the client first with: .\start-app-direct.ps1" -ForegroundColor Yellow
    exit 1
}

# Test admin token for API access
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNjI1NDQ5MTIwfQ.tO8SWH9lFgQMGRgxbVh8wd9W4Iq1LH-F_r9ZvEdf-xQ"

# Function to make authorized API calls
function Invoke-AuthorizedApiCall {
    param (
        [string]$Endpoint,
        [string]$Method = "GET"
    )
    
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $adminToken"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$serverUrl$Endpoint" -Headers $headers -Method $Method
        return $response
    } catch {
        Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Test Inventory Module
Write-Host "`n=== Testing Inventory Module ===" -ForegroundColor Magenta

# Check if inventory API is available
Write-Host "`nChecking inventory API..." -ForegroundColor Yellow
$inventoryResponse = Invoke-AuthorizedApiCall -Endpoint "/api/inventory/properties"

if ($inventoryResponse) {
    Write-Host "✅ Inventory API is accessible" -ForegroundColor Green
    # Display property count
    $propertyCount = ($inventoryResponse | Measure-Object).Count
    Write-Host "Found $propertyCount properties in inventory" -ForegroundColor Cyan
} else {
    Write-Host "❌ Inventory API is not accessible" -ForegroundColor Red
}

# Check specific routes for inventory
$inventoryRoutes = @(
    "/api/inventory/properties/count",
    "/api/inventory/properties/stats",
    "/api/inventory/counties"
)

foreach ($route in $inventoryRoutes) {
    Write-Host "`nTesting route: $route" -ForegroundColor Yellow
    $response = Invoke-AuthorizedApiCall -Endpoint $route
    
    if ($response) {
        Write-Host "✅ Route is accessible" -ForegroundColor Green
        Write-Host "Response preview:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 1 | Write-Host
    } else {
        Write-Host "❌ Route is not accessible" -ForegroundColor Red
    }
}

# 2. Test US Map
Write-Host "`n=== Testing US Map Component ===" -ForegroundColor Magenta

# Check if US Map API is available
Write-Host "`nChecking US Map API..." -ForegroundColor Yellow
$usmapResponse = Invoke-AuthorizedApiCall -Endpoint "/api/usmap"

if ($usmapResponse) {
    Write-Host "✅ US Map API is accessible" -ForegroundColor Green
    Write-Host "US Map data preview:" -ForegroundColor Cyan
    $usmapResponse | Select-Object -Property _id, updatedAt | ConvertTo-Json | Write-Host
} else {
    Write-Host "❌ US Map API is not accessible" -ForegroundColor Red
}

# Check states data
Write-Host "`nChecking states data..." -ForegroundColor Yellow
$statesResponse = Invoke-AuthorizedApiCall -Endpoint "/api/states"

if ($statesResponse) {
    Write-Host "✅ States API is accessible" -ForegroundColor Green
    $stateCount = ($statesResponse | Measure-Object).Count
    Write-Host "Found $stateCount states in the database" -ForegroundColor Cyan
} else {
    Write-Host "❌ States API is not accessible" -ForegroundColor Red
}

# 3. Test Collector Wizard
Write-Host "`n=== Testing Collector Wizard Component ===" -ForegroundColor Magenta

# Check if wizard API is available
Write-Host "`nChecking wizard endpoints..." -ForegroundColor Yellow
$wizardResponse = Invoke-AuthorizedApiCall -Endpoint "/api/wizard/steps"

if ($wizardResponse) {
    Write-Host "✅ Wizard API is accessible" -ForegroundColor Green
    Write-Host "Wizard steps:" -ForegroundColor Cyan
    $wizardResponse | ConvertTo-Json | Write-Host
} else {
    Write-Host "❌ Wizard API is not accessible" -ForegroundColor Red
}

# Check collector configuration
Write-Host "`nChecking collector configuration..." -ForegroundColor Yellow
$collectorResponse = Invoke-AuthorizedApiCall -Endpoint "/api/collectors/config"

if ($collectorResponse) {
    Write-Host "✅ Collector configuration API is accessible" -ForegroundColor Green
    Write-Host "Collector config preview:" -ForegroundColor Cyan
    $collectorResponse | ConvertTo-Json -Depth 1 | Write-Host
} else {
    Write-Host "❌ Collector configuration API is not accessible" -ForegroundColor Red
}

# 4. Open Component URLs in Browser
Write-Host "`n=== Component URLs to Test in Browser ===" -ForegroundColor Magenta

$componentUrls = @{
    "Inventory Dashboard" = "$clientUrl/inventory"
    "US Map View" = "$clientUrl/map"
    "Collector Wizard" = "$clientUrl/wizard"
    "Property Details" = "$clientUrl/inventory/properties"
}

foreach ($component in $componentUrls.Keys) {
    $url = $componentUrls[$component]
    Write-Host "`n$component" -ForegroundColor Yellow
    Write-Host "URL: $url" -ForegroundColor Cyan
}

Write-Host "`nWould you like to open any of these components in the browser? (y/n)" -ForegroundColor Yellow
$openBrowser = Read-Host

if ($openBrowser -eq "y") {
    Write-Host "`nWhich component? (inventory/map/wizard/properties)" -ForegroundColor Yellow
    $selectedComponent = Read-Host
    
    switch ($selectedComponent.ToLower()) {
        "inventory" { Start-Process $componentUrls["Inventory Dashboard"] }
        "map" { Start-Process $componentUrls["US Map View"] }
        "wizard" { Start-Process $componentUrls["Collector Wizard"] }
        "properties" { Start-Process $componentUrls["Property Details"] }
        default { Write-Host "Invalid selection" -ForegroundColor Red }
    }
}

Write-Host "`nComponent testing completed. See results above for details." -ForegroundColor Cyan 