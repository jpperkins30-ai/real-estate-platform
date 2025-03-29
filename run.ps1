# run.ps1 (in project root)
# Menu script for running various commands in the Real Estate Platform project

# Clear the screen
Clear-Host

# Function to show the menu
function Show-Menu {
    Write-Host "=== Real Estate Platform - Command Menu ===" -ForegroundColor Cyan
    Write-Host "1. Setup project (first time setup)" -ForegroundColor White
    Write-Host "2. Start full application (server & client)" -ForegroundColor White
    Write-Host "3. Start server only" -ForegroundColor White
    Write-Host "4. Initialize USMap" -ForegroundColor White
    Write-Host "5. Check Swagger documentation" -ForegroundColor White
    Write-Host "6. Run database seed script" -ForegroundColor White
    Write-Host "7. Check application health" -ForegroundColor White
    Write-Host "8. Exit" -ForegroundColor White
    Write-Host ""
    Write-Host "Enter your choice (1-8):" -ForegroundColor Yellow -NoNewline
}

# Function to execute the selected option
function Execute-Option {
    param (
        [int]$Option
    )
    
    switch ($Option) {
        1 {
            # Setup project
            Write-Host "Running setup script..." -ForegroundColor Green
            & "$PSScriptRoot\setup.ps1"
        }
        2 {
            # Start full application
            Write-Host "Starting full application..." -ForegroundColor Green
            & "$PSScriptRoot\start-app.ps1"
        }
        3 {
            # Start server only
            Write-Host "Starting server only..." -ForegroundColor Green
            & "$PSScriptRoot\server\scripts\start-server.ps1"
        }
        4 {
            # Initialize USMap
            Write-Host "Initializing USMap..." -ForegroundColor Green
            & "$PSScriptRoot\server\scripts\create-usmap.ps1"
        }
        5 {
            # Check Swagger documentation
            Write-Host "Checking Swagger documentation..." -ForegroundColor Green
            & "$PSScriptRoot\server\scripts\check-swagger.ps1"
        }
        6 {
            # Run database seed script
            Write-Host "Running database seed script..." -ForegroundColor Green
            Set-Location -Path "$PSScriptRoot\server"
            npm run seed
            Set-Location -Path $PSScriptRoot
        }
        7 {
            # Check application health
            Write-Host "Checking application health..." -ForegroundColor Green
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET -TimeoutSec 5
                if ($response.StatusCode -eq 200) {
                    Write-Host "Server is running and healthy!" -ForegroundColor Green
                    Write-Host $response.Content -ForegroundColor Cyan
                } else {
                    Write-Host "Server returned unexpected status code: $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "Server does not appear to be running or is not responding" -ForegroundColor Red
            }
        }
        8 {
            # Exit
            Write-Host "Exiting..." -ForegroundColor Green
            exit
        }
        default {
            Write-Host "Invalid option. Please try again." -ForegroundColor Red
        }
    }
    
    # Pause to read output
    Write-Host ""
    Write-Host "Press any key to return to menu..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Clear the screen for the next menu display
    Clear-Host
}

# Main loop
while ($true) {
    Show-Menu
    $choice = Read-Host " "
    
    # Try to parse the input as an integer
    try {
        $option = [int]$choice
    } catch {
        $option = 0  # Invalid option
    }
    
    # Execute the selected option
    Execute-Option -Option $option
} 