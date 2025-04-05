# run.ps1 (in project root)
# Menu script for running various commands in the Real Estate Platform project

# Main application runner and test script
param (
    [switch]$StartServer = $false,
    [switch]$StartClient = $false,
    [switch]$RunTests = $false,
    [switch]$RunApiTests = $false,
    [string]$ApiEnvironment = "development",
    [switch]$GenerateApiTestData = $false,
    [string]$ApiReportDir = ".\postman\reports",
    [switch]$BuildOnly = $false,
    [switch]$Help = $false
)

# Display help information
function Show-Help {
    Write-Host "Usage: .\run.ps1 [options]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  -StartServer          Start the backend server" -ForegroundColor Yellow
    Write-Host "  -StartClient          Start the frontend client" -ForegroundColor Yellow
    Write-Host "  -RunTests             Run unit and integration tests" -ForegroundColor Yellow
    Write-Host "  -RunApiTests          Run API tests with Postman/Newman" -ForegroundColor Yellow
    Write-Host "  -ApiEnvironment       Specify API test environment (default: development)" -ForegroundColor Yellow
    Write-Host "  -GenerateApiTestData  Generate test data for API tests" -ForegroundColor Yellow
    Write-Host "  -ApiReportDir         Directory for API test reports (default: .\postman\reports)" -ForegroundColor Yellow
    Write-Host "  -BuildOnly            Only build the application without starting" -ForegroundColor Yellow
    Write-Host "  -Help                 Display this help message" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\run.ps1 -StartServer -StartClient" -ForegroundColor Gray
    Write-Host "  .\run.ps1 -RunTests" -ForegroundColor Gray
    Write-Host "  .\run.ps1 -RunApiTests -ApiEnvironment testing -GenerateApiTestData" -ForegroundColor Gray
}

if ($Help) {
    Show-Help
    exit 0
}

# Set the current directory to the project root
$ProjectRoot = Get-Location

# Function to run API tests
function Run-ApiTests {
    param (
        [string]$Environment = "development",
        [string]$ReportDir = ".\postman\reports",
        [switch]$GenerateData = $false
    )
    
    Write-Host "====== Running API Tests ======" -ForegroundColor Cyan
    
    # Check if Newman is installed
    try {
        $NewmanVersion = newman --version
        Write-Host "Newman version: $NewmanVersion" -ForegroundColor Green
    } 
    catch {
        Write-Host "Newman is not installed. Installing now..." -ForegroundColor Yellow
        npm install -g newman newman-reporter-htmlextra
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to install Newman. Please install it manually." -ForegroundColor Red
            return $false
        }
    }
    
    # Create reports directory if it doesn't exist
    if (-not (Test-Path -Path $ReportDir)) {
        Write-Host "Creating reports directory: $ReportDir" -ForegroundColor Yellow
        New-Item -Path $ReportDir -ItemType Directory -Force | Out-Null
    }
    
    # Set environment variables for Node.js script
    $env:ENV_FILE = "$Environment.json"
    $env:GENERATE_TEST_DATA = $GenerateData.ToString().ToLower()
    $env:CI = "false"
    
    Write-Host "Starting API tests with environment: $Environment" -ForegroundColor Cyan
    Write-Host "Generate test data: $($GenerateData.ToString())" -ForegroundColor Cyan
    Write-Host "Report directory: $ReportDir" -ForegroundColor Cyan
    
    # Run test data generator if requested
    if ($GenerateData) {
        Write-Host "Generating test data..." -ForegroundColor Yellow
        node .\postman\scripts\generate-test-data.js
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Test data generation failed. Check error messages above." -ForegroundColor Red
            return $false
        }
        
        Write-Host "Test data generation complete." -ForegroundColor Green
    }
    
    # Define collections to run
    $collections = @(
        "auth.json",
        "layouts.json",
        "preferences.json",
        "health-check.json",
        "e2e-flow.json"
    )
    
    $overallSuccess = $true
    
    # Run each collection
    foreach ($collection in $collections) {
        $collectionName = [System.IO.Path]::GetFileNameWithoutExtension($collection)
        $collectionPath = ".\postman\collections\$collection"
        $environmentPath = ".\postman\environments\$Environment.json"
        $reportPath = "$ReportDir\$collectionName-report.html"
        
        Write-Host "Running collection: $collectionName" -ForegroundColor Cyan
        
        # Check if collection file exists
        if (-not (Test-Path -Path $collectionPath)) {
            Write-Host "Collection file not found: $collectionPath" -ForegroundColor Red
            $overallSuccess = $false
            continue
        }
        
        # Check if environment file exists
        if (-not (Test-Path -Path $environmentPath)) {
            Write-Host "Environment file not found: $environmentPath" -ForegroundColor Red
            $overallSuccess = $false
            continue
        }
        
        # Run Newman with the collection
        newman run $collectionPath -e $environmentPath -r cli,htmlextra --reporter-htmlextra-export $reportPath
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Collection $collectionName failed. Check the report at $reportPath" -ForegroundColor Red
            $overallSuccess = $false
        } else {
            Write-Host "Collection $collectionName completed successfully." -ForegroundColor Green
        }
    }
    
    Write-Host "All API tests completed. Reports are available in $ReportDir" -ForegroundColor Cyan
    
    # Open reports directory
    if (Test-Path -Path $ReportDir) {
        Invoke-Item $ReportDir
    }
    
    return $overallSuccess
}

# Function to run unit and integration tests
function Run-Tests {
    Write-Host "====== Running Unit and Integration Tests ======" -ForegroundColor Cyan
    npm test
    return $LASTEXITCODE -eq 0
}

# Function to start the server
function Start-BackendServer {
    Write-Host "====== Starting Backend Server ======" -ForegroundColor Cyan
    Start-Process -FilePath "npm" -ArgumentList "run server" -NoNewWindow
    Write-Host "Backend server started. Waiting for it to initialize..." -ForegroundColor Green
    Start-Sleep -Seconds 5
}

# Function to start the client
function Start-FrontendClient {
    Write-Host "====== Starting Frontend Client ======" -ForegroundColor Cyan
    Start-Process -FilePath "npm" -ArgumentList "run client" -NoNewWindow
    Write-Host "Frontend client started." -ForegroundColor Green
}

# Function to build the application
function Build-Application {
    Write-Host "====== Building Application ======" -ForegroundColor Cyan
    npm run build
    return $LASTEXITCODE -eq 0
}

# Main execution logic
$success = $true

if ($BuildOnly) {
    $buildSuccess = Build-Application
    $success = $success -and $buildSuccess
} else {
    if ($StartServer) {
        Start-BackendServer
    }
    
    if ($StartClient) {
        Start-FrontendClient
    }
    
    if ($RunTests) {
        $testSuccess = Run-Tests
        $success = $success -and $testSuccess
    }
    
    if ($RunApiTests) {
        $apiTestSuccess = Run-ApiTests -Environment $ApiEnvironment -ReportDir $ApiReportDir -GenerateData:$GenerateApiTestData
        $success = $success -and $apiTestSuccess
    }
}

if (-not ($StartServer -or $StartClient -or $RunTests -or $RunApiTests -or $BuildOnly)) {
    Write-Host "No actions specified. Use -Help for usage information." -ForegroundColor Yellow
    Show-Help
}

# Return overall success status
if ($success) {
    exit 0
} else {
    exit 1
} 