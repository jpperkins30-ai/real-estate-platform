# PowerShell script for pre-commit test validation
# This script validates test files before allowing commit

$ErrorActionPreference = "Stop"

# Current directory
$rootDir = $PSScriptRoot
$testsDir = Join-Path $rootDir "src/__tests__"
$testPlanPath = Join-Path $rootDir "test-plan.json"

# Colors for console output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-ColorOutput Green "Node.js version: $nodeVersion"
}
catch {
    Write-ColorOutput Red "Node.js is not installed. Please install Node.js to run this script."
    exit 1
}

# Check if the tests directory exists
if (-not (Test-Path $testsDir)) {
    Write-ColorOutput Red "Tests directory not found: $testsDir"
    exit 1
}

# Check if test plan exists
if (-not (Test-Path $testPlanPath)) {
    Write-ColorOutput Yellow "Warning: Test plan not found: $testPlanPath"
    Write-ColorOutput Yellow "Test case ID validation will be skipped."
}
else {
    Write-ColorOutput Green "Test plan found: $testPlanPath"
}

Write-ColorOutput Cyan "Starting pre-commit test validation..."

# 1. Run the validation script
try {
    Write-ColorOutput Yellow "Validating test file structure and test case IDs..."
    cd $rootDir
    node validate-all-tests.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Test validation failed! Please fix the issues before committing."
        Write-ColorOutput Yellow "Common issues include:"
        Write-ColorOutput Yellow "- Missing test case IDs in test descriptions (format: 'TC123: test description')"
        Write-ColorOutput Yellow "- Test case IDs not found in the test plan"
        Write-ColorOutput Yellow "- Incorrect file naming convention"
        Write-ColorOutput Yellow "Use 'node create-test.js' to generate valid test files."
        exit 1
    }
    
    Write-ColorOutput Green "Test structure and test case ID validation passed!"
}
catch {
    Write-ColorOutput Red "Error running test validation: $_"
    exit 1
}

# 2. Run linter on test files
try {
    Write-ColorOutput Yellow "Running linter on test files..."
    npm run lint -- --quiet "src/__tests__/**/*.{ts,tsx}"
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Linting failed! Please fix the issues before committing."
        exit 1
    }
    
    Write-ColorOutput Green "Linting passed!"
}
catch {
    Write-ColorOutput Red "Error running linter: $_"
    exit 1
}

# 3. Run tests for changed files
try {
    Write-ColorOutput Yellow "Running tests for changed files..."
    
    # Get list of changed files
    $changedFiles = git diff --cached --name-only --diff-filter=ACM | Where-Object { $_ -match "src/.*\.(ts|tsx)$" -and $_ -notmatch "__tests__" }
    
    if ($changedFiles.Count -gt 0) {
        foreach ($file in $changedFiles) {
            $relativePath = $file -replace "src/", ""
            $relativePath = $relativePath -replace "/", "_"
            $relativePath = $relativePath -replace "\\", "_"
            $testFile = "src/__tests__/*${relativePath.Substring(0, $relativePath.LastIndexOf("."))}.test.*"
            
            Write-ColorOutput Cyan "Looking for tests matching: $testFile"
            
            $matchingTests = Get-ChildItem -Path $rootDir -Include $testFile -Recurse
            
            if ($matchingTests.Count -gt 0) {
                Write-ColorOutput Yellow "Running tests for $file..."
                npm test -- $testFile --run
                
                if ($LASTEXITCODE -ne 0) {
                    Write-ColorOutput Red "Tests failed for $file! Please fix the issues before committing."
                    exit 1
                }
            }
            else {
                Write-ColorOutput Yellow "No tests found for $file. Consider adding tests with proper test case IDs."
                
                # Get file path segments for category detection
                $pathSegments = $relativePath -split "[/\\]"
                $category = $pathSegments[0]
                $componentName = $pathSegments[-1] -replace "\.(ts|tsx)$", ""
                
                # Suggest test case IDs based on component type
                Write-ColorOutput Yellow "You can create a test with:"
                Write-ColorOutput Yellow "node create-test.js --component=$category/$componentName"
            }
        }
    }
    else {
        Write-ColorOutput Yellow "No relevant files changed. Skipping test run."
    }
}
catch {
    Write-ColorOutput Red "Error running tests: $_"
    exit 1
}

# All checks passed
Write-ColorOutput Green "All pre-commit checks passed! Proceeding with commit..."
exit 0 