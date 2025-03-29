# Unified run script for Real Estate Platform with authorization
Write-Host "Starting Real Estate Platform with enhanced authorization..." -ForegroundColor Cyan

# Function to test if a path exists
function Test-ScriptPath {
    param (
        [string]$Path
    )
    return Test-Path -Path $Path
}

# Store current directory
$rootDir = $PWD.Path
Write-Host "Project root: $rootDir" -ForegroundColor Cyan

# Determine paths
$serverDir = Join-Path -Path $rootDir -ChildPath "server"
$clientDir = Join-Path -Path $rootDir -ChildPath "client"
$roleAuthPath = Join-Path -Path $serverDir -ChildPath "src\middleware\roleAuth.ts"

Write-Host "Checking paths..." -ForegroundColor Yellow
if (-not (Test-ScriptPath -Path $serverDir)) {
    Write-Host "ERROR: Server directory not found at: $serverDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-ScriptPath -Path $clientDir)) {
    Write-Host "ERROR: Client directory not found at: $clientDir" -ForegroundColor Red
    exit 1
}

# Check MongoDB connection
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
$mongoStatus = $null
try {
    # Try to connect to MongoDB
    $mongoStatus = mongosh --eval "db.runCommand({ping:1})" --quiet
} catch {
    Write-Host "WARNING: MongoDB status check failed. Is MongoDB running?" -ForegroundColor Yellow
}

if ($mongoStatus -match "ok") {
    Write-Host "MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "MongoDB might not be running. Please start MongoDB before continuing." -ForegroundColor Yellow
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne "y") {
        exit 0
    }
}

# Check and fix environment variables
Write-Host "Checking environment variables..." -ForegroundColor Yellow
$envFile = Join-Path -Path $serverDir -ChildPath ".env"
if (-not (Test-ScriptPath -Path $envFile)) {
    # Create .env file from example if it doesn't exist
    $envExampleFile = Join-Path -Path $serverDir -ChildPath ".env.example"
    if (Test-ScriptPath -Path $envExampleFile) {
        Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item -Path $envExampleFile -Destination $envFile
        
        # Set JWT_SECRET if not present
        $jwtSecret = "dev-" + [Guid]::NewGuid().ToString()
        $envContent = Get-Content -Path $envFile -Raw
        if ($envContent -notmatch "JWT_SECRET=") {
            Add-Content -Path $envFile -Value "`nJWT_SECRET=$jwtSecret"
            Write-Host "Added JWT_SECRET to .env file" -ForegroundColor Green
        }
    } else {
        Write-Host "ERROR: .env.example file not found. Cannot create .env file." -ForegroundColor Red
        exit 1
    }
}

# Install dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$serverNodeModules = Join-Path -Path $serverDir -ChildPath "node_modules"
$clientNodeModules = Join-Path -Path $clientDir -ChildPath "node_modules"

if (-not (Test-ScriptPath -Path $serverNodeModules)) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    Set-Location -Path $serverDir
    npm install
    Set-Location -Path $rootDir
}

if (-not (Test-ScriptPath -Path $clientNodeModules)) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    Set-Location -Path $clientDir
    npm install
    Set-Location -Path $rootDir
}

# Start the server in a new PowerShell window
Write-Host "`nStarting server in a new window..." -ForegroundColor Green
$serverCommand = "cd '$serverDir'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit -Command $serverCommand"

# Wait for server to start
Write-Host "Waiting for server to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start the client in a new PowerShell window
Write-Host "`nStarting client in a new window..." -ForegroundColor Green
$clientCommand = "cd '$clientDir'; npm start"
Start-Process powershell -ArgumentList "-NoExit -Command $clientCommand"

Write-Host "`nApplication started. Please close the terminal windows when done." -ForegroundColor Cyan
Write-Host "NOTE: Authorization is implemented with the following roles:" -ForegroundColor Yellow
Write-Host "- 'admin': Full access to all features" -ForegroundColor Yellow
Write-Host "- 'analyst': Access to export and reporting features" -ForegroundColor Yellow
Write-Host "- 'user': Basic access to the platform" -ForegroundColor Yellow
Write-Host "- 'dataManager': Access to data management features" -ForegroundColor Yellow

# Return to original directory
Set-Location -Path $rootDir 