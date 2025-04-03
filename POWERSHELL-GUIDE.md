# Windows PowerShell Guide for Real Estate Platform

> **Note**: This document is part of the Real Estate Platform's technical documentation suite. For related guides, see:
> - [Development Guide](./docs/development-guide.md) - Development environment setup and workflows
> - [Testing Guide](./TESTING-GUIDE.md) - Testing procedures and guidelines
> - [Component Testing Guide](./docs/component-test-guide.md) - Detailed component testing procedures
> - [Security Guide](./docs/SECURITY.md) - Security considerations and best practices

This guide addresses common issues when running the Real Estate Platform application in Windows PowerShell.

## PowerShell Token Error Resolution

PowerShell uses a different command separator than Command Prompt (CMD) or Bash. When you see errors like:

```
The token '&&' is not a valid statement separator in this version.
```

This is because PowerShell uses semicolons (`;`) instead of ampersands (`&&`) for command chaining.

## Running the Application in PowerShell

### Option 1: Use the PowerShell-Compatible Script (Recommended)

For the easiest experience, use the provided PowerShell script:

```powershell
.\run-windows-app.ps1
```

This script properly handles PowerShell syntax and starts both the server and client applications in separate windows.

### Option 2: Fix TypeScript Errors and Start Server

If you're having TypeScript errors:

```powershell
# First, run the TypeScript error fixing script
.\fix-typescript-errors.ps1

# Then start the server
cd server
npm run dev

# Open a new PowerShell window and start the client
cd client
npm run dev
```

### Option 3: Manual Navigation (Correct Syntax)

If you need to run commands manually in PowerShell:

```powershell
# INCORRECT (will cause token error):
cd server && npm run dev

# CORRECT (use semicolons):
cd server; npm run dev

# For multiple commands:
cd server; npm install; npm run dev
```

## Common Commands Fixed for PowerShell

Here are common commands with the proper PowerShell syntax:

| Bash/CMD Syntax | PowerShell Syntax |
|-----------------|-------------------|
| `cd server && npm run dev` | `cd server; npm run dev` |
| `npm install && npm start` | `npm install; npm start` |
| `git add . && git commit -m "msg"` | `git add .; git commit -m "msg"` |

## Troubleshooting

### Script Execution Policy

If you can't run PowerShell scripts, you might encounter this error:

```
File cannot be loaded because running scripts is disabled on this system.
```

To fix this, run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### MongoDB Connection Issues

If the application can't connect to MongoDB:

```powershell
# Check if MongoDB is running
Get-Service MongoDB

# Start MongoDB if it's not running
Start-Service MongoDB
```

### Installing Dependencies

If you need to install dependencies for both server and client:

```powershell
# For server
cd server; npm install

# For client
cd client; npm install
```

## Additional PowerShell Scripts

We've included several PowerShell scripts to help you run and maintain the application:

- `run-windows-app.ps1` - Starts both server and client
- `fix-typescript-errors.ps1` - Fixes common TypeScript errors
- `fix-server-token-error.ps1` - Starts just the server with proper syntax
- `init-geo-data.ps1` - Initializes geographic data directories
- `init-db-data.ps1` - Initializes database with geographic entities
- `run-powershell.ps1` - Improved script to run the application
- `create-usmap.js` - Creates the US Map entry in MongoDB directly
- `initialize-git.ps1` - Initializes Git repository
- `create-backup.ps1` - Creates a Git backup

## Need Help?

For additional assistance, refer to:
- `docs/troubleshooting.md` - General troubleshooting guide
- `docs/development-environment-setup.md` - Development environment setup 