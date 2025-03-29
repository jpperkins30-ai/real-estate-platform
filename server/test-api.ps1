# Test API endpoints with role authorization middleware
Write-Host "Testing API endpoints with authorization..." -ForegroundColor Cyan

# Define the base URL
$baseUrl = "http://localhost:4000"

# Function to make HTTP requests with error handling
function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Endpoint,
        [string]$Token = "",
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Method = $Method
        Uri = "$baseUrl$Endpoint"
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $message = $_.ErrorDetails.Message
        if ($message) {
            try {
                $errorObj = $message | ConvertFrom-Json
                Write-Host "Error $statusCode : $($errorObj.message)" -ForegroundColor Red
            } catch {
                Write-Host "Error $statusCode : $message" -ForegroundColor Red
            }
        } else {
            Write-Host "Error $statusCode : $($_.Exception.Message)" -ForegroundColor Red
        }
        return $null
    }
}

# Test server connectivity first
Write-Host "Testing server connection..." -ForegroundColor Yellow
try {
    # Using ping endpoint instead of root path
    $response = Invoke-WebRequest -Uri "$baseUrl/api/ping"
    Write-Host "Server is running. Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    try {
        # Try the health route if ping doesn't exist
        $response = Invoke-WebRequest -Uri "$baseUrl/api/health"
        Write-Host "Server is running. Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        try {
            # Try with a simple GET request to the API endpoint
            $response = Invoke-WebRequest -Uri "$baseUrl/api"
            Write-Host "Server is running. Status: $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "Server is not running or not accessible. Error: $($_.Exception.Message)" -ForegroundColor Red
            exit
        }
    }
}

# Test API endpoints with different authorization scenarios
Write-Host "`nTesting authorization middleware..." -ForegroundColor Yellow

# 1. Test endpoint without authorization token
Write-Host "`n1. Accessing export endpoint without token..." -ForegroundColor Blue
Invoke-ApiRequest -Method "GET" -Endpoint "/api/export/properties/csv"

# 2. Test with mock token for admin role
Write-Host "`n2. Accessing export endpoint with admin role token..." -ForegroundColor Blue
$mockAdminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluSWQiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNjE1NDQ5MTIwfQ.4x1w0qYlRK5JnnF1X1NHM5jpFz5KHJbJ1NB-5g1Jy-s"
Invoke-ApiRequest -Method "GET" -Endpoint "/api/export/properties/csv" -Token $mockAdminToken

# 3. Test with mock token for user role (should get 403)
Write-Host "`n3. Accessing export endpoint with regular user role token..." -ForegroundColor Blue
$mockUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJJZCIsInJvbGUiOiJ1c2VyIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjE1NDQ5MTIwfQ.eH8ioL6ZzAi6KHdKPEhkChvX5WTR-QJPGtB_SXokhkw"
Invoke-ApiRequest -Method "GET" -Endpoint "/api/export/properties/csv" -Token $mockUserToken

# 4. Test with mock token for analyst role (should work)
Write-Host "`n4. Accessing export endpoint with analyst role token..." -ForegroundColor Blue
$mockAnalystToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFuYWx5c3RJZCIsInJvbGUiOiJhbmFseXN0IiwiZW1haWwiOiJhbmFseXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjE1NDQ5MTIwfQ.eyADqQUo0TJaERPQ5tQEtzkCXQYhNYH3UoGPB8vO9j8"
Invoke-ApiRequest -Method "GET" -Endpoint "/api/export/properties/csv" -Token $mockAnalystToken

Write-Host "`nAuthorization middleware tests completed." -ForegroundColor Green 