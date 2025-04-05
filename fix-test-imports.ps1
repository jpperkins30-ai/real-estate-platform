# Script to fix import paths in test files
# This script updates import paths in the flattened test files structure

# Change to client directory
Set-Location -Path ".\client" -ErrorAction SilentlyContinue
if (-not $?) {
    Write-Host "Error: Could not navigate to client directory. Make sure you're running this from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "Fixing import paths in test files..." -ForegroundColor Cyan

# Get all test files
$testFiles = Get-ChildItem -Path ".\src\_tests_\*.test.ts*" -Recurse

# Function to fix a file's imports
function Fix-TestImports {
    param (
        [string]$filePath
    )
    
    $fileName = Split-Path -Leaf $filePath
    Write-Host "Fixing imports in $fileName..." -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content -Path $filePath -Raw
    $originalContent = $content
    
    # Fix absolute imports starting with src/
    $content = $content -replace 'from\s+[''"]src\/', 'from "../'
    
    # Fix relative path imports that go up too many levels
    $content = $content -replace 'from\s+[''"]\.\.\/\.\.\/services\/', 'from "../services/'
    $content = $content -replace 'from\s+[''"]\.\.\/\.\.\/hooks\/', 'from "../hooks/'
    $content = $content -replace 'from\s+[''"]\.\.\/\.\.\/components\/', 'from "../components/'
    $content = $content -replace 'from\s+[''"]\.\.\/\.\.\/context\/', 'from "../context/'
    $content = $content -replace 'from\s+[''"]\.\.\/\.\.\/test-utils[''"]', 'from "../test/test-utils"'
    
    # Fix imports that point to test fixtures, mocks, etc.
    $content = $content -replace 'from\s+[''"]\.\.\/\.\.\/__mocks__\/', 'from "../_mocks_/'
    
    # Fix imports that might point to test-util.ts in the same directory (now it's in src/test)
    $content = $content -replace 'from\s+[''"]\.\/test-utils[''"]', 'from "../test/test-utils"'
    
    # If nothing changed, it's possible we need more specific fixes
    if ($content -eq $originalContent) {
        # Special case for TC101_hooks_useMaximizable.test.tsx
        if ($fileName -match "TC101_hooks_useMaximizable") {
            $content = $content -replace 'from\s+[''"]src\/hooks\/useMaximizable[''"]', 'from "../hooks/useMaximizable"'
        }
        # Special case for component imports
        elseif ($fileName -match "components") {
            $componentName = ""
            if ($fileName -match "TC\d+_components_(\w+)\.test") {
                $componentName = $Matches[1]
                $content = $content -replace "from\s+['].*?$componentName[']", "from '../components/$componentName'"
                $content = $content -replace "from\s+[`"].*?$componentName[`"]", "from `"../components/$componentName`""
            }
            elseif ($fileName -match "TC\d+_components_(\w+)_(\w+)\.test") {
                $componentType = $Matches[1]
                $componentName = $Matches[2]
                $content = $content -replace "from\s+['].*?$componentName[']", "from '../components/$componentType/$componentName'"
                $content = $content -replace "from\s+[`"].*?$componentName[`"]", "from `"../components/$componentType/$componentName`""
            }
        }
        # Special case for hooks
        elseif ($fileName -match "hooks") {
            $hookName = ""
            if ($fileName -match "TC\d+_hooks_(\w+)\.test") {
                $hookName = $Matches[1]
                $content = $content -replace "from\s+['].*?$hookName[']", "from '../hooks/$hookName'"
                $content = $content -replace "from\s+[`"].*?$hookName[`"]", "from `"../hooks/$hookName`""
            }
        }
        # Special case for services
        elseif ($fileName -match "services") {
            $serviceName = ""
            if ($fileName -match "TC\d+_services_(\w+)\.test") {
                $serviceName = $Matches[1]
                $content = $content -replace "from\s+['].*?$serviceName[']", "from '../services/$serviceName'"
                $content = $content -replace "from\s+[`"].*?$serviceName[`"]", "from `"../services/$serviceName`""
            }
        }
        # Special case for context
        elseif ($fileName -match "context") {
            $contextName = ""
            if ($fileName -match "TC\d+_context_(\w+)\.test") {
                $contextName = $Matches[1]
                $content = $content -replace "from\s+['].*?$contextName[']", "from '../context/$contextName'"
                $content = $content -replace "from\s+[`"].*?$contextName[`"]", "from `"../context/$contextName`""
            }
        }
    }
    
    # Save the updated content back to the file
    if ($content -ne $originalContent) {
        $content | Set-Content -Path $filePath -NoNewline
        Write-Host "  Updated imports in $fileName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  No changes needed for $fileName" -ForegroundColor Gray
        return $false
    }
}

# Track statistics
$totalFiles = $testFiles.Count
$updatedFiles = 0

# Process each test file
foreach ($file in $testFiles) {
    $updated = Fix-TestImports -filePath $file.FullName
    if ($updated) {
        $updatedFiles++
    }
}

Write-Host ""
Write-Host "Import path fixing complete!" -ForegroundColor Cyan
Write-Host "Updated $updatedFiles out of $totalFiles test files." -ForegroundColor Cyan
Write-Host "Now try running the tests again with: npx vitest run" -ForegroundColor Cyan

# Return to the original directory
Set-Location -Path ".." 