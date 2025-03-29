# setup.ps1 (in project root)
Write-Host "Setting up the Real Estate Platform..." -ForegroundColor Green

# Install server dependencies
$serverDir = Join-Path -Path $PSScriptRoot -ChildPath "server"
if (Test-Path -Path $serverDir) {
    Set-Location -Path $serverDir
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install
    
    # Setup environment
    Write-Host "Creating .env file if not exists..." -ForegroundColor Yellow
    $envFile = Join-Path -Path $serverDir -ChildPath ".env"
    if (-not (Test-Path -Path $envFile)) {
        @"
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/real-estate-platform
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=1d
LOG_LEVEL=info
"@ | Out-File -FilePath $envFile -Encoding utf8
        Write-Host "Created default .env file. Please update with your settings." -ForegroundColor Cyan
    } else {
        Write-Host ".env file already exists." -ForegroundColor Cyan
    }
    
    # Initialize USMap
    $createUsmapScript = Join-Path -Path $serverDir -ChildPath "scripts\create-usmap.ps1"
    if (Test-Path -Path $createUsmapScript) {
        Write-Host "Initializing USMap..." -ForegroundColor Yellow
        & $createUsmapScript
    } else {
        Write-Host "WARNING: USMap initialization script not found." -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: Server directory not found at: $serverDir" -ForegroundColor Red
    exit 1
}

# Install client dependencies
$clientDir = Join-Path -Path $PSScriptRoot -ChildPath "client"
if (Test-Path -Path $clientDir) {
    Set-Location -Path $clientDir
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "ERROR: Client directory not found at: $clientDir" -ForegroundColor Red
    exit 1
}

# Return to project root
Set-Location -Path $PSScriptRoot

Write-Host @"

Setup complete!

To start the application:
- Server only: ./server/scripts/start-server.ps1
- Full application: ./start-app.ps1 

"@ -ForegroundColor Green 