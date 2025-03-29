# Windows Quick Start Guide

This guide provides quick instructions for running the Real Estate Platform on Windows systems with PowerShell limitations.

## Running the Application

### Method 1: Using Batch Files (Recommended)

1. **Start the application using the batch file:**
   ```
   run-app.bat
   ```
   This will open two command windows - one for the server and one for the client.

2. **Test specific components:**
   ```
   open-component.bat inventory
   open-component.bat map
   open-component.bat wizard
   ```

### Method 2: Manual Execution

If batch files don't work, follow these steps:

1. **Start the server:**
   - Open Command Prompt (not PowerShell)
   - Navigate to the project directory:
     ```
     cd C:\path\to\real-estate-platform
     cd server
     npm run dev
     ```

2. **Start the client:**
   - Open another Command Prompt window
   - Navigate to the project directory:
     ```
     cd C:\path\to\real-estate-platform
     cd client
     npm start
     ```

3. **Access the components in your browser:**
   - Inventory: http://localhost:3000/inventory
   - US Map: http://localhost:3000/map
   - Wizard: http://localhost:3000/wizard

## PowerShell Workarounds

### For PowerShell Users

If you need to use PowerShell, use these commands instead of `&&`:

```powershell
# Instead of: cd server && npm run dev
Set-Location -Path server
npm run dev

# To run commands in sequence:
Set-Location -Path server; npm run dev
```

### Create New PowerShell Sessions

To run commands in different directories without changing your current directory:

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path 'C:\path\to\real-estate-platform\server'; npm run dev"
```

## Common Issues and Solutions

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:**
1. Find and close the process using port 4000:
   ```
   netstat -ano | findstr :4000
   taskkill /PID <PID> /F
   ```
   
2. Or use a different port by editing `.env` in the server directory:
   ```
   PORT=4001
   ```

### Script Execution Policy

```
File cannot be loaded because running scripts is disabled on this system
```

**Solution:**
1. Run PowerShell as Administrator
2. Set execution policy for current session:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

### Module Not Found Errors

```
Error: Cannot find module
```

**Solution:**
1. Make sure you're in the correct directory
2. Reinstall dependencies:
   ```
   cd server
   npm install
   
   cd ../client
   npm install
   ```

## Testing Authorization

To test role-based authorization:

1. Use this token for admin access:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNjI1NDQ5MTIwfQ.tO8SWH9lFgQMGRgxbVh8wd9W4Iq1LH-F_r9ZvEdf-xQ
   ```
   
2. Available roles to test:
   - `admin`: Full access
   - `analyst`: Can access export features
   - `dataManager`: Can manage data collection
   - `user`: Limited access

## Documentation References

For more detailed information, refer to:

- `MANUAL-START-INSTRUCTIONS.md`: Detailed startup instructions
- `TESTING-GUIDE.md`: Comprehensive testing procedures
- `README-AUTH.md`: Authorization implementation details

## Contact Information

If you encounter issues not covered in this guide, please contact the development team:

- Email: devteam@realestate-platform.com
- Support Ticket: http://support.realestate-platform.com
- GitHub Issues: [Project Issues](https://github.com/real-estate-platform/issues) 