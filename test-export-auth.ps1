# Test export authorization endpoints
Write-Host "Testing Export API with Role Authorization..." -ForegroundColor Cyan

# Set the base URL
$baseUrl = "http://localhost:4000"

# Function to make API calls with proper error handling
function Invoke-ApiWithToken {
    param (
        [string]$Endpoint,
        [string]$Role,
        [string]$TokenValue = ""
    )
    
    Write-Host "`nTesting with $Role role..." -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($TokenValue) {
        $headers["Authorization"] = "Bearer $TokenValue"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Headers $headers -Method Get -ErrorAction Stop
        Write-Host "SUCCESS: Access granted for $Role role" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401) {
            Write-Host "BLOCKED: Authentication required (401)" -ForegroundColor Red
        }
        elseif ($statusCode -eq 403) {
            Write-Host "BLOCKED: Permission denied for $Role role (403)" -ForegroundColor Red
        }
        else {
            Write-Host "ERROR: Status code $statusCode" -ForegroundColor Red
            Write-Host $_.Exception.Message
        }
        
        return $false
    }
}

# Check if server is running
Write-Host "Checking if server is running..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method GET -TimeoutSec 5
    Write-Host "Server is running and responding" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Server is not running or not accessible at $baseUrl" -ForegroundColor Red
    Write-Host "Please start the server first" -ForegroundColor Yellow
    exit 1
}

# Show all available roles
Write-Host "`nAuthorization Roles:" -ForegroundColor Cyan
Write-Host "- admin: Full access to all features"
Write-Host "- analyst: Can export and view reports"
Write-Host "- dataManager: Can manage data but not admin features"
Write-Host "- user: Basic user with limited access"

# JWT tokens for testing (format: header.payload.signature)
# These are simplified tokens with role information in the payload for testing
$tokens = @{
    "admin" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNjI1NDQ5MTIwfQ.tO8SWH9lFgQMGRgxbVh8wd9W4Iq1LH-F_r9ZvEdf-xQ"
    "analyst" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFuYWx5c3QtdXNlci1pZCIsInJvbGUiOiJhbmFseXN0IiwiZW1haWwiOiJhbmFseXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjI1NDQ5MTIwfQ.KIQC6TPF2nHoBIuJQMXdmcZ9PZ31-A6iW5miY3iRSdU"
    "dataManager" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRhdGEtbWFuYWdlci1pZCIsInJvbGUiOiJkYXRhTWFuYWdlciIsImVtYWlsIjoiZGF0YUBleGFtcGxlLmNvbSIsImlhdCI6MTYyNTQ0OTEyMH0.rlhmD-LHrJfP8y7Y_JfLQPLzgPLXU-17F5FSEhqKdFQ"
    "user" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItaWQiLCJyb2xlIjoidXNlciIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTYyNTQ0OTEyMH0.yRQD7lvWmH5VuOJ_AQMQgaha6rNICy_PkiKIaDGCgoo"
}

Write-Host "`n=== Testing Export API Endpoints ===" -ForegroundColor Magenta

# API endpoints to test
$exportEndpoints = @(
    "/api/export/properties/csv",
    "/api/export/counties/csv"
)

foreach ($endpoint in $exportEndpoints) {
    Write-Host "`n--- Testing Endpoint: $endpoint ---" -ForegroundColor Cyan
    
    # Test without token
    Write-Host "`nTesting without authentication token..." -ForegroundColor Yellow
    $noTokenResult = Invoke-ApiWithToken -Endpoint $endpoint -Role "anonymous"
    
    # Test with all roles
    foreach ($role in $tokens.Keys) {
        $token = $tokens[$role]
        $roleResult = Invoke-ApiWithToken -Endpoint $endpoint -Role $role -TokenValue $token
    }
}

Write-Host "`nTesting completed. Check results above to verify role authorization is working properly." -ForegroundColor Cyan 