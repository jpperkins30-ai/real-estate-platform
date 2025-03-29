# API Endpoint Checker for Real Estate Platform
Write-Host "API Endpoint Checker for Real Estate Platform" -ForegroundColor Cyan

# Admin token for authenticated requests
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNjI1NDQ5MTIwfQ.tO8SWH9lFgQMGRgxbVh8wd9W4Iq1LH-F_r9ZvEdf-xQ"

# Function to check if an API endpoint is accessible
function Test-ApiEndpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Token = ""
    )
    
    Write-Host "`nChecking $Name endpoint:" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
        Write-Host "Using authentication token" -ForegroundColor Gray
    }
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Headers $headers -Method GET -TimeoutSec 10
        Write-Host "✅ Endpoint is accessible - Status: $($response.StatusCode)" -ForegroundColor Green
        return $true
    } 
    catch [System.Net.WebException] {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "❌ Error accessing endpoint - Status: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host "   Authentication required. Check your token." -ForegroundColor Yellow
        }
        elseif ($statusCode -eq 403) {
            Write-Host "   Access forbidden. Insufficient permissions." -ForegroundColor Yellow
        }
        elseif ($statusCode -eq 404) {
            Write-Host "   Endpoint not found. Check URL path." -ForegroundColor Yellow
        }
        else {
            Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        return $false
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# First check if server is running
Write-Host "`nChecking if server is running..." -ForegroundColor Magenta
$serverRunning = Test-ApiEndpoint -Name "Server health" -Url "http://localhost:4000/api/health"

if (-not $serverRunning) {
    Write-Host "`nServer appears to be offline. Please start the server with .\start-app-direct.ps1" -ForegroundColor Red
    exit 1
}

# Define a list of endpoints to check
$endpoints = @(
    @{ Name = "Inventory Properties"; Url = "http://localhost:4000/api/inventory/properties"; RequiresAuth = $true },
    @{ Name = "Inventory Properties Count"; Url = "http://localhost:4000/api/inventory/properties/count"; RequiresAuth = $true },
    @{ Name = "Inventory Counties"; Url = "http://localhost:4000/api/inventory/counties"; RequiresAuth = $true },
    @{ Name = "US Map"; Url = "http://localhost:4000/api/usmap"; RequiresAuth = $true },
    @{ Name = "States"; Url = "http://localhost:4000/api/states"; RequiresAuth = $true },
    @{ Name = "Wizard Steps"; Url = "http://localhost:4000/api/wizard/steps"; RequiresAuth = $true },
    @{ Name = "Collector Configuration"; Url = "http://localhost:4000/api/collectors/config"; RequiresAuth = $true }
)

# Initialize counters
$successCount = 0
$failureCount = 0

# Check each endpoint
foreach ($endpoint in $endpoints) {
    $token = if ($endpoint.RequiresAuth) { $adminToken } else { "" }
    $result = Test-ApiEndpoint -Name $endpoint.Name -Url $endpoint.Url -Token $token
    
    if ($result) {
        $successCount++
    } else {
        $failureCount++
    }
}

# Display summary
Write-Host "`n=== API Endpoint Check Summary ===" -ForegroundColor Magenta
Write-Host "Total endpoints checked: $($endpoints.Count)" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failureCount" -ForegroundColor $(if ($failureCount -gt 0) { "Red" } else { "Green" })

if ($failureCount -gt 0) {
    Write-Host "`nSome endpoints are not accessible. Please check the server logs for errors." -ForegroundColor Yellow
} else {
    Write-Host "`nAll endpoints are accessible! The server is working correctly." -ForegroundColor Green
}

Write-Host "`nTo manually test the client components, use a web browser to access:" -ForegroundColor Cyan
Write-Host "- Inventory Dashboard: http://localhost:3000/inventory" -ForegroundColor Gray
Write-Host "- US Map: http://localhost:3000/map" -ForegroundColor Gray
Write-Host "- Collector Wizard: http://localhost:3000/wizard" -ForegroundColor Gray 