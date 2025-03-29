# PowerShell script to check if Swagger documentation is available
Write-Host "Checking Swagger documentation..."

# Define the URL to check
$url = "http://localhost:4000/api-docs"

try {
    # Start the server in the background if it's not already running
    $serverRunning = $false
    
    try {
        $testConnection = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET -TimeoutSec 2
        if ($testConnection.StatusCode -eq 200) {
            $serverRunning = $true
            Write-Host "Server is already running."
        }
    } catch {
        Write-Host "Server is not running. Starting server..."
        $serverProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command `"cd $PSScriptRoot/server; npm run dev:js`"" -PassThru -WindowStyle Hidden
        
        # Wait for server to start
        Write-Host "Waiting for server to start..."
        Start-Sleep -Seconds 5
    }
    
    # Try to access the Swagger documentation
    Write-Host "Attempting to access Swagger documentation at $url"
    $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Success! Swagger documentation is available at $url"
        
        # Try to get the Swagger JSON spec
        $jsonUrl = "http://localhost:4000/api-docs.json"
        $jsonResponse = Invoke-WebRequest -Uri $jsonUrl -Method GET -TimeoutSec 5
        
        if ($jsonResponse.StatusCode -eq 200) {
            Write-Host "Swagger JSON spec is available at $jsonUrl"
        }
    } else {
        Write-Host "Swagger documentation is not available. Status code: $($response.StatusCode)"
    }
} catch {
    Write-Host "Error checking Swagger documentation: $_"
} finally {
    # If we started the server, stop it
    if (-not $serverRunning -and $serverProcess) {
        Stop-Process -Id $serverProcess.Id -Force
        Write-Host "Server stopped."
    }
} 