# PowerShell script to kill processes on port 4000 and start the server
# Usage: .\kill-port-and-start.ps1

Write-Host "Checking for processes using port 4000..." -ForegroundColor Cyan

# Define port number
$PORT = 4000
if ($env:PORT) {
    $PORT = $env:PORT
}

# Find processes using port 4000 - using backtick escape for colon
$portPattern = ":" + $PORT + "\s"
$processes = netstat -ano | Select-String $portPattern | Select-String "LISTENING"

if ($processes) {
    Write-Host "Found process(es) using port $PORT. Attempting to kill..." -ForegroundColor Yellow
    
    # Extract PIDs
    $processPids = @()
    foreach ($process in $processes) {
        $parts = $process -split '\s+'
        if ($parts.Count -ge 5) {
            $processPid = $parts[-1]
            $processPids += $processPid
        }
    }
    
    # Remove duplicates
    $uniquePids = $processPids | Select-Object -Unique
    
    # Kill each process
    foreach ($processPid in $uniquePids) {
        try {
            Write-Host "Killing process with PID $processPid..." -ForegroundColor Yellow
            Stop-Process -Id $processPid -Force
            Write-Host "Successfully killed process $processPid" -ForegroundColor Green
        } catch {
            Write-Host "Failed to kill process $processPid: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No process found using port $PORT" -ForegroundColor Green
}

# Load environment variables from .env
Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found in the current directory." -ForegroundColor Red
    exit 1
}

# Load environment variables from .env file
Get-Content .env | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
        $key, $value = $line.Split('=', 2)
        if ($key -and $value) {
            # Set environment variable for current process
            [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), "Process")
            # Also set in PowerShell's environment
            Set-Item -Path "env:$($key.Trim())" -Value $value.Trim()
        }
    }
}

# Verify JWT_SECRET is set
if (-not $env:JWT_SECRET) {
    Write-Host "ERROR: JWT_SECRET environment variable is not set." -ForegroundColor Red
    Write-Host "Please check your .env file or set it manually." -ForegroundColor Red
    exit 1
}

# Display configuration
Write-Host "Environment configuration:" -ForegroundColor Green
Write-Host "- JWT_SECRET: SET" -ForegroundColor Green
Write-Host "- MONGODB_URI: $($env:MONGODB_URI)" -ForegroundColor Green
Write-Host "- PORT: $($env:PORT)" -ForegroundColor Green
Write-Host "- NODE_ENV: $($env:NODE_ENV)" -ForegroundColor Green

Write-Host ""
Write-Host "Starting server..." -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev 