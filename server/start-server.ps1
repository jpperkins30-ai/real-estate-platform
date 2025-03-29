# PowerShell script to start the server with proper environment variables
Write-Host "Starting server with environment variables..." -ForegroundColor Green

# Set JWT_SECRET environment variable directly in PowerShell
Write-Host "Setting JWT_SECRET environment variable..." -ForegroundColor Yellow
$env:JWT_SECRET = "powershell-direct-set-jwt-secret-development-only"

# List all environment variables for debugging
Write-Host "`nEnvironment variables set in PowerShell:" -ForegroundColor Cyan
Write-Host "- JWT_SECRET: [SET]"
Write-Host "- MONGODB_URI: $($env:MONGODB_URI)"
Write-Host "- PORT: $($env:PORT)"
Write-Host "- NODE_ENV: $($env:NODE_ENV)"

# Choose the method to start the server
$useTypeScript = $true

if ($useTypeScript) {
    Write-Host "`nStarting server with TypeScript (ts-node)..." -ForegroundColor Cyan
    
    # First kill any process using port 4000
    Write-Host "Checking for processes using port 4000..." -ForegroundColor Yellow
    $processInfo = netstat -ano | findstr :4000
    
    if ($processInfo) {
        $processInfo | ForEach-Object {
            if ($_ -match "LISTENING\s+(\d+)") {
                $processPid = $matches[1]
                Write-Host "Killing process with PID $processPid using port 4000..." -ForegroundColor Red
                taskkill /F /PID $processPid
            }
        }
    } else {
        Write-Host "No process found using port 4000" -ForegroundColor Green
    }
    
    # Start the server using ts-node
    Write-Host "Starting server..." -ForegroundColor Green
    npx ts-node --transpile-only src/index.ts
} else {
    Write-Host "`nStarting server with Node.js..." -ForegroundColor Cyan
    node start-with-env.js
}

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 