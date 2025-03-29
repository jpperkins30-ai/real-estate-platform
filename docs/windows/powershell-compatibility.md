# PowerShell Compatibility Guide

This guide addresses the compatibility issues with PowerShell in the Real Estate Platform, particularly focused on the command chaining limitations that affect scripts and commands.

## Understanding the Problem

### The `&&` Operator Limitation

PowerShell does not support the `&&` operator for command chaining that is commonly used in Unix-like shells and Windows Command Prompt. When you try to use commands like:

```
cd server && npm run dev
```

You'll encounter this error:

```
At line:1 char:11
+ cd server && npm run dev
+           ~~
The token '&&' is not a valid statement separator in this version.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : InvalidEndOfLine
```

### Impact on Scripts

This limitation affects:
- Start scripts that need to change directory and then run commands
- Development workflows that use multiple chained commands
- Scripts ported from Unix-like systems or Command Prompt

## PowerShell Alternatives

### 1. Sequential Commands with Semicolon

In PowerShell, you can use the semicolon (`;`) to separate commands:

```powershell
Set-Location -Path server; npm run dev
```

**Limitations:**
- The second command runs regardless of whether the first command succeeds
- This doesn't provide the conditional execution that `&&` offers

### 2. Command Blocks

Use code blocks for more control:

```powershell
if ((Set-Location -Path server) -eq $null) { npm run dev }
```

### 3. Using PowerShell's Native Commands

Replace Unix-style commands with PowerShell equivalents:

```powershell
# Instead of: cd server && npm run dev
Set-Location -Path server
npm run dev
```

### 4. Using PowerShell Scripts

Create `.ps1` script files that contain multiple commands:

```powershell
# start-server.ps1
Set-Location -Path "$PSScriptRoot\server"
npm run dev
```

### 5. Launching Separate Processes

For parallel execution, launch new PowerShell instances:

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path 'server'; npm run dev"
```

## Implemented Solutions in the Project

### PowerShell Scripts

We've created several PowerShell scripts that work around these limitations:

1. **start-app-direct.ps1**
   ```powershell
   # Get the current directory
   $rootDir = Get-Location
   
   # Check if server directory exists
   $serverDir = Join-Path -Path $rootDir -ChildPath "server"
   if (-not (Test-Path -Path $serverDir -PathType Container)) {
       Write-Host "Error: Server directory not found at $serverDir" -ForegroundColor Red
       exit 1
   }
   
   # Start the server in a new window
   $serverCommand = "Set-Location -Path '$serverDir'; npm run dev"
   Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverCommand
   
   # Wait for server to initialize
   Start-Sleep -Seconds 5
   
   # Start the client in a new window
   $clientDir = Join-Path -Path $rootDir -ChildPath "client"
   $clientCommand = "Set-Location -Path '$clientDir'; npm start"
   Start-Process powershell -ArgumentList "-NoExit", "-Command", $clientCommand
   ```

2. **test-auth.ps1**
   ```powershell
   # Store current directory
   $rootDir = $PWD.Path
   
   # Determine paths
   $serverDir = Join-Path -Path $rootDir -ChildPath "server"
   
   # Start the server in a new PowerShell window
   $serverCommand = "cd '$serverDir'; node src/simple-server.js"
   Start-Process powershell -ArgumentList "-NoExit -Command $serverCommand"
   
   # Wait for server to start
   Start-Sleep -Seconds 5
   
   # Run the test script
   Set-Location -Path $serverDir
   & $testScriptPath
   ```

### Batch File Alternatives

For users who prefer Command Prompt or have issues with PowerShell execution policies, we've created batch file equivalents:

1. **run-app.bat**
   ```batch
   @echo off
   echo Starting Real Estate Platform...
   
   :: Start the server in a new window
   start cmd /k "cd server && npm run dev"
   
   :: Give the server time to start
   timeout /t 5 /nobreak > nul
   
   :: Start the client in a new window
   start cmd /k "cd client && npm start"
   
   echo Application started in separate windows!
   ```

2. **open-component.bat**
   ```batch
   @echo off
   setlocal enabledelayedexpansion
   
   :: Default to inventory if no argument provided
   set COMPONENT=inventory
   if not "%~1"=="" set COMPONENT=%~1
   
   :: Open the appropriate URL based on the component
   if "%COMPONENT%"=="inventory" (
       start "" "http://localhost:3000/inventory"
   ) else if "%COMPONENT%"=="map" (
       start "" "http://localhost:3000/map"
   )
   ```

## Script Execution Policy Issues

PowerShell's execution policy may prevent running scripts, even after addressing the `&&` operator issue.

### Common Error Messages

```
File cannot be loaded because running scripts is disabled on this system.
```

```
.\scripts\run-simple-server.ps1 : The term '.\scripts\run-simple-server.ps1' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

### Solutions

1. **Temporarily Change Execution Policy**
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

2. **Sign the PowerShell Scripts**
   This is a more secure approach but requires a code signing certificate.

3. **Use Batch Files Instead**
   Batch files (`.bat`) don't have the same execution restrictions.

## Best Practices for PowerShell Development

1. **Use PowerShell's Native Commands**
   - Prefer `Set-Location` over `cd`
   - Use PowerShell parameters with named arguments

2. **Create Robust Scripts**
   - Add error handling with `try/catch`
   - Use absolute paths when possible
   - Check for prerequisites before executing commands

3. **Documentation and Comments**
   - Document PowerShell-specific workarounds
   - Provide batch file alternatives for critical functionality

4. **Testing**
   - Test scripts in different PowerShell versions
   - Verify scripts work with restricted execution policies

## Recommended PowerShell Configuration

For development work, we recommend setting up PowerShell with these configurations:

```powershell
# Allow local scripts to run without signing
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Set up common aliases to match Unix commands
Set-Alias -Name which -Value Get-Command
```

## Additional Resources

- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [Execution Policies in PowerShell](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)
- [PowerShell for Unix Users](https://docs.microsoft.com/en-us/powershell/scripting/learn/unix-to-windows)

## Related Documentation

- [Windows Setup Guide](./environment-setup.md)
- [Script Execution Policy Guide](./script-execution-policy.md)
- [Troubleshooting PowerShell Issues](../troubleshooting/powershell-issues.md) 