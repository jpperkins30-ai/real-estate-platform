Write-Host "Starting Real Estate Platform in PowerShell..." -ForegroundColor Green
Write-Host ""

Write-Host "======================================"
Write-Host "Step 1: Starting the backend server" -ForegroundColor Cyan
Write-Host "======================================"

# Start server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$PSScriptRoot\server'; npm run dev"
Write-Host "Server starting on http://localhost:4000"
Write-Host ""

# Wait for server to start
Start-Sleep -Seconds 5

Write-Host "======================================"
Write-Host "Step 2: Starting the frontend client" -ForegroundColor Cyan
Write-Host "======================================"

# Start client in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$PSScriptRoot\client'; npm run dev"
Write-Host "Client starting on http://localhost:5173"
Write-Host ""

Write-Host "======================================"
Write-Host "Application URLs:" -ForegroundColor Yellow
Write-Host "======================================"
Write-Host "Backend API: http://localhost:4000"
Write-Host "Swagger API Docs: http://localhost:4000/api-docs"
Write-Host "Frontend UI: http://localhost:5173"
Write-Host ""

Write-Host "Application started successfully!" -ForegroundColor Green
Write-Host "To stop the application, close the PowerShell windows." -ForegroundColor Yellow 