# PowerShell script to run test-backend.js
Write-Host "Running backend test script..." -ForegroundColor Green
node test-backend.js
Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 