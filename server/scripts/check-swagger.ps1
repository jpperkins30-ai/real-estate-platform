# server/scripts/check-swagger.ps1
Write-Host "Checking Swagger documentation..." -ForegroundColor Green

# Navigate to server directory (get parent of scripts folder)
$serverDir = Join-Path -Path $PSScriptRoot -ChildPath ".." 
$serverDir = Resolve-Path $serverDir
Set-Location -Path $serverDir

Write-Host "Server directory: $serverDir" -ForegroundColor Cyan

# Define the URL to check
$url = "http://localhost:4000/api-docs"
$healthUrl = "http://localhost:4000/api/health"
$jsonUrl = "http://localhost:4000/api-docs.json"

try {
    # Check if server is running
    Write-Host "Checking if server is running..." -ForegroundColor Yellow
    $serverRunning = $false
    
    try {
        $testConnection = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 2
        if ($testConnection.StatusCode -eq 200) {
            $serverRunning = $true
            Write-Host "Server is already running." -ForegroundColor Green
        }
    } catch {
        Write-Host "Server is not running. Will start server temporarily..." -ForegroundColor Yellow
        
        # Set environment variables
        $env:NODE_PATH = Join-Path -Path $serverDir -ChildPath "src"
        
        # Start server in background
        $serverProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command `"cd '$serverDir'; npm run dev`"" -PassThru -WindowStyle Hidden
        
        # Wait for server to start
        Write-Host "Waiting for server to start (5 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
    
    # Try to access Swagger documentation
    Write-Host "Checking Swagger UI at $url" -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS: Swagger UI is available at $url" -ForegroundColor Green
        
        # Check JSON endpoint
        Write-Host "Checking Swagger JSON at $jsonUrl" -ForegroundColor Yellow
        $jsonResponse = Invoke-WebRequest -Uri $jsonUrl -Method GET -TimeoutSec 5
        
        if ($jsonResponse.StatusCode -eq 200) {
            Write-Host "SUCCESS: Swagger JSON spec is available at $jsonUrl" -ForegroundColor Green
        }
    } else {
        Write-Host "ERROR: Swagger UI is not available. Status code: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Failed to access Swagger documentation: $_" -ForegroundColor Red
} finally {
    # Stop the server if we started it
    if (-not $serverRunning -and $serverProcess) {
        Write-Host "Stopping temporary server..." -ForegroundColor Yellow
        Stop-Process -Id $serverProcess.Id -Force
        Write-Host "Temporary server stopped." -ForegroundColor Green
    }
} 