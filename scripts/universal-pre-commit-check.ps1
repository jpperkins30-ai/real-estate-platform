# Universal pre-commit check for test file structure
#
# This script can validate both client and server test files to ensure
# they follow the standardized structure

param(
    [Parameter()]
    [string]$ProjectType = "both" # Can be "client", "server", or "both"
)

Write-Host "Universal Test File Structure Validator" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

function Validate-TestFiles {
    param (
        [string]$ProjectPath,
        [string]$ProjectName,
        [string]$TestDirName = "_tests_"
    )
    
    Write-Host "Validating $ProjectName test files..." -ForegroundColor Cyan
    
    # Path to test directory
    $testDir = Join-Path $ProjectPath "src/$TestDirName"
    $testPlanPath = Join-Path $ProjectPath "test-plan.json"
    
    # Ensure the directories exist
    if (-not (Test-Path $testDir)) {
        Write-Host "Test directory not found: $testDir" -ForegroundColor Red
        return $false
    }
    
    if (-not (Test-Path $testPlanPath)) {
        Write-Host "Test plan not found: $testPlanPath" -ForegroundColor Red
        return $false
    }
    
    # Find all test files
    $testFiles = Get-ChildItem -Path $testDir -File | Where-Object { $_.Name -match '\.test\.(ts|tsx)$' }
    
    $errors = @()
    $validCount = 0
    
    Write-Host "Checking $($testFiles.Count) test files..." -ForegroundColor Yellow
    
    foreach ($file in $testFiles) {
        $fileName = $file.Name
        $filePath = $file.FullName
        $issues = @()
        
        # Check if file is in the correct directory (not in subdirectories)
        if ($file.DirectoryName -ne (Resolve-Path $testDir).Path) {
            $issues += "Not in the root test directory"
        }
        
        # Check for proper naming convention (TCxxx_)
        if (-not ($fileName -match '^TC\d+_.+\.test\.(ts|tsx)$')) {
            $issues += "Missing test case ID prefix (should start with 'TCxxx_')"
        }
        
        # Check first line for test case description
        $firstLine = Get-Content -Path $filePath -TotalCount 1
        if (-not ($firstLine -match '^// Test Case \d+:')) {
            $issues += "Missing test case description comment on first line"
        }
        
        if ($issues.Count -gt 0) {
            $errors += [PSCustomObject]@{
                FileName = $fileName
                Issues = $issues
                ProjectName = $ProjectName
            }
        } else {
            $validCount++
        }
    }
    
    # Display results
    Write-Host ""
    Write-Host "$ProjectName Test File Validation Results:" -ForegroundColor Cyan
    Write-Host "---------------------------" -ForegroundColor Cyan
    Write-Host "Valid files: $validCount / $($testFiles.Count)" -ForegroundColor $(if ($validCount -eq $testFiles.Count) { "Green" } else { "Yellow" })
    
    if ($errors.Count -gt 0) {
        Write-Host ""
        Write-Host "Files with issues:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "$($error.FileName)" -ForegroundColor Red
            foreach ($issue in $error.Issues) {
                Write-Host " - $issue" -ForegroundColor Yellow
            }
            Write-Host ""
        }
        
        return $false
    } else {
        Write-Host "All $ProjectName test files follow the standard structure!" -ForegroundColor Green
        return $true
    }
}

$clientSuccess = $true
$serverSuccess = $true

# Validate based on the ProjectType parameter
if ($ProjectType -eq "client" -or $ProjectType -eq "both") {
    $clientSuccess = Validate-TestFiles -ProjectPath "client" -ProjectName "Client" -TestDirName "_tests_"
}

if ($ProjectType -eq "server" -or $ProjectType -eq "both") {
    $serverSuccess = Validate-TestFiles -ProjectPath "server" -ProjectName "Server" -TestDirName "_tests_"
}

# Overall results
Write-Host ""
Write-Host "Overall Validation Results:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

if ($clientSuccess -and $serverSuccess) {
    Write-Host "All tests follow the standard structure!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some test files need to be fixed to match the standard structure." -ForegroundColor Red
    Write-Host "Run the appropriate migration scripts to fix the issues." -ForegroundColor Yellow
    exit 1
} 