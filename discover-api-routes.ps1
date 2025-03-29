# API Route Discovery Script
Write-Host "API Route Discovery for Real Estate Platform" -ForegroundColor Cyan

# Basic health check
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running. Status: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "Environment: $($healthResponse.environment)" -ForegroundColor Yellow
    Write-Host "JWT Configured: $($healthResponse.jwt)" -ForegroundColor Yellow
}
catch {
    Write-Host "❌ Server is not running or health endpoint is not available" -ForegroundColor Red
    Write-Host "Please start the server first using .\start-app-direct.ps1" -ForegroundColor Yellow
    exit 1
}

# Admin token for authenticated requests
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNjI1NDQ5MTIwfQ.tO8SWH9lFgQMGRgxbVh8wd9W4Iq1LH-F_r9ZvEdf-xQ"

# Function to check an API route
function Test-ApiRoute {
    param (
        [string]$Route,
        [string]$Token = "",
        [string]$Method = "GET"
    )
    
    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000$Route" -Headers $headers -Method $Method -TimeoutSec 5
        Write-Host "✅ $Route - Status: $($response.StatusCode)" -ForegroundColor Green
        return $true
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 401) {
            Write-Host "⚠️ $Route - Status: 401 (Unauthorized)" -ForegroundColor Yellow
            return $false
        }
        elseif ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Write-Host "⚠️ $Route - Status: 403 (Forbidden)" -ForegroundColor Yellow
            return $false
        }
        elseif ($_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-Host "❌ $Route - Status: 404 (Not Found)" -ForegroundColor Red
            return $false
        }
        else {
            Write-Host "❌ $Route - Error: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# List of common API route patterns to try
$baseRoutes = @(
    "/api",
    "/api/properties",
    "/api/inventory",
    "/api/inventory/properties",
    "/api/data/properties",
    "/api/usmap",
    "/api/map",
    "/api/us-map",
    "/api/states",
    "/api/counties",
    "/api/wizard",
    "/api/wizard/steps",
    "/api/collectors",
    "/api/collectors/config",
    "/api/export",
    "/api/export/properties/csv"
)

# Try base routes without authentication
Write-Host "`nChecking public API routes:" -ForegroundColor Magenta
foreach ($route in $baseRoutes) {
    Test-ApiRoute -Route $route
}

# Try routes with authentication
Write-Host "`nChecking authenticated API routes:" -ForegroundColor Magenta
foreach ($route in $baseRoutes) {
    Test-ApiRoute -Route $route -Token $adminToken
}

# Try to discover routes from server/src directory
Write-Host "`nScanning server code for API routes..." -ForegroundColor Magenta
$serverDir = Join-Path -Path $PWD.Path -ChildPath "server"
$routesDir = Join-Path -Path $serverDir -ChildPath "src\routes"

if (Test-Path -Path $routesDir) {
    Write-Host "Found routes directory: $routesDir" -ForegroundColor Green
    
    # Get all route files
    $routeFiles = Get-ChildItem -Path $routesDir -Filter "*.ts" -Recurse
    Write-Host "Found $($routeFiles.Count) route files" -ForegroundColor Yellow
    
    foreach ($file in $routeFiles) {
        Write-Host "`nRoutes from $($file.Name):" -ForegroundColor Cyan
        
        # Extract router.get/post/put/delete patterns
        $content = Get-Content -Path $file.FullName -Raw
        $routeMatches = [regex]::Matches($content, "router\.(get|post|put|delete|patch)\(['`"]([^'`"]+)")
        
        if ($routeMatches.Count -gt 0) {
            foreach ($match in $routeMatches) {
                $method = $match.Groups[1].Value.ToUpper()
                $routePath = $match.Groups[2].Value
                
                # Skip routes that are already fully qualified
                if ($routePath.StartsWith("/api/")) {
                    Write-Host "  $method $routePath" -ForegroundColor Gray
                    Test-ApiRoute -Route $routePath -Token $adminToken -Method $method
                } 
                else {
                    # Try to extract base path from file name
                    $basePath = $file.Name -replace "\.ts$|\.js$|\.routes$", ""
                    $fullPath = "/api/$basePath$routePath"
                    Write-Host "  $method $fullPath (derived from filename)" -ForegroundColor Gray
                    Test-ApiRoute -Route $fullPath -Token $adminToken -Method $method
                }
            }
        } else {
            Write-Host "  No router endpoints found" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ Routes directory not found: $routesDir" -ForegroundColor Red
}

Write-Host "`nAPI Route discovery completed." -ForegroundColor Cyan
Write-Host "You can manually test accessible routes in a web browser." -ForegroundColor Yellow 