# PowerShell script for running API tests in Windows environment
param (
    [string]$Environment = "development",
    [string]$ReportDir = ".\postman\reports",
    [switch]$GenerateData = $false
)

# Set script location as current directory
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path (Split-Path -Parent (Split-Path -Parent $ScriptPath))

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

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
        exit 1
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
        exit 1
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

# Run each collection
foreach ($collection in $collections) {
    $collectionName = [System.IO.Path]::GetFileNameWithoutExtension($collection)
    $collectionPath = ".\postman\collections\$collection"
    $environmentPath = ".\postman\environments\$Environment.json"
    $reportPath = "$ReportDir\$collectionName-report.html"
    
    Write-Host "Running collection: $collectionName" -ForegroundColor Cyan
    
    # Run Newman with the collection
    newman run $collectionPath -e $environmentPath -r cli,htmlextra --reporter-htmlextra-export $reportPath
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Collection $collectionName failed. Check the report at $reportPath" -ForegroundColor Red
    } else {
        Write-Host "Collection $collectionName completed successfully." -ForegroundColor Green
    }
}

Write-Host "All API tests completed. Reports are available in $ReportDir" -ForegroundColor Cyan

# Open reports directory
if (Test-Path -Path $ReportDir) {
    Invoke-Item $ReportDir
}

# Return exit code
exit $LASTEXITCODE 