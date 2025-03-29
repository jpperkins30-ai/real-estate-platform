# Detailed Open Issues and Documentation References

This document provides detailed information about open issues in the Real Estate Platform and references to relevant documentation files in the `docs` folder.

## 1. PowerShell Command Execution Issues

### Problem Description
PowerShell on Windows does not support the `&&` operator for command chaining that works in Unix-like shells. This affects startup scripts and commands like:
```
cd server && npm run dev
```

### Error Messages
```
At line:1 char:11
+ cd server && npm run dev
+           ~~
The token '&&' is not a valid statement separator in this version.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : InvalidEndOfLine
```

### Implemented Solutions
1. Created separate script files that use PowerShell's native command sequencing
2. Implemented batch files (`.bat`) for Windows Command Prompt
3. Used alternative PowerShell syntax for command sequencing:
   ```powershell
   # Option 1: Command sequences
   Set-Location -Path server; npm run dev
   
   # Option 2: Separate process launching
   Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path 'server'; npm run dev"
   ```

### Documentation References
- `/docs/powershell-compatibility.md` - Details on PowerShell limitations and workarounds
- `/docs/script-usage-guide.md` - Guide for using the various scripts created
- `/docs/windows-command-reference.md` - Reference for Windows command execution

## 2. Server-Client Communication Issues

### Problem Description
API endpoints expected by client components return 404 errors, particularly for:
- Inventory module endpoints
- US Map component endpoints
- Collector Wizard endpoints

### Error Patterns
During testing, we saw consistent 404 errors when attempting to access:
```
http://localhost:4000/api/inventory/properties
http://localhost:4000/api/usmap
http://localhost:4000/api/wizard/steps
```

### Root Cause Analysis
1. API route paths may be inconsistent between server implementation and client expectations
2. Some API endpoints may not be properly registered in Express router
3. Middleware configuration might block routes from being properly exposed

### Troubleshooting Steps
1. Used `discover-api-routes.ps1` to scan for available routes
2. Manually inspected route files in `/server/src/routes` directory
3. Tested alternative route paths and checked server logs for errors

### Documentation References
- `/docs/api-routes.md` - Documentation of all expected API routes
- `/docs/api-troubleshooting.md` - Guide for troubleshooting API issues
- `/docs/testing-api-endpoints.md` - Procedures for testing API functionality

## 3. Script Execution Permission Issues

### Problem Description
PowerShell script execution is restricted by default on many Windows systems, causing scripts to fail with execution policy errors.

### Error Messages
```
.\scripts\run-simple-server.ps1 : The term '.\scripts\run-simple-server.ps1' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

```
File cannot be loaded because running scripts is disabled on this system.
```

### Security Implications
- Execution policies are security features in Windows designed to prevent running malicious scripts
- Changing execution policies has security implications that should be considered

### Implemented Solutions
1. Created alternative batch files (`.bat`) that bypass PowerShell execution restrictions
2. Provided instructions for temporarily changing execution policy:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
3. Added documentation for securely configuring PowerShell for development

### Documentation References
- `/docs/security/powershell-security.md` - Information on PowerShell security settings
- `/docs/setup/windows-setup.md` - Windows-specific setup instructions
- `/docs/script-execution-policy.md` - Guide for managing execution policies

## 4. Port Conflict Issues

### Problem Description
Multiple instances of the server trying to use the same port (default 4000) cause startup failures.

### Error Messages
```
Error: listen EADDRINUSE: address already in use :::4000
    at Server.setupListenHandle [as _listen2] (node:net:1937:16)
    at listenInCluster (node:net:1994:12)
    at Server.listen (node:net:2099:7)
```

### Root Causes
1. Previous server instance still running in the background
2. Other applications using port 4000
3. Multiple server instances started in different terminal windows

### Implemented Solutions
1. Added port checking to startup scripts
2. Created troubleshooting instructions for identifying and killing processes
3. Implemented configuration for alternative ports:
   ```
   # In server/.env
   PORT=4001
   ```

### Documentation References
- `/docs/network/port-configuration.md` - Guide for configuring network ports
- `/docs/troubleshooting/port-conflicts.md` - Troubleshooting port conflict issues
- `/docs/deployment/environment-variables.md` - Environment variable configuration

## 5. Module Resolution Issues

### Problem Description
Node.js fails to find modules due to incorrect paths or missing dependencies.

### Error Messages
```
Error: Cannot find module 'C:\path\to\simple-server.js'
    at Function._resolveFilename (node:internal/modules/cjs/loader:1225:15)
```

### Root Causes
1. Incorrect working directory when running Node commands
2. Missing or corrupt `node_modules` directory
3. Inconsistent path references in scripts

### Implemented Solutions
1. Created scripts with absolute path references
2. Added directory verification before executing commands
3. Included dependency installation checks in startup scripts

### Documentation References
- `/docs/nodejs/module-resolution.md` - Information on Node.js module resolution
- `/docs/project-structure.md` - Documentation of project directory structure
- `/docs/dependency-management.md` - Guide for managing dependencies

## 6. API Authorization Issues

### Problem Description
Role-based authorization not working consistently across all API endpoints.

### Symptoms
1. Some restricted endpoints accessible without authorization
2. Inconsistent token validation behavior
3. Role checks not properly enforced on specific routes

### Implemented Solutions
1. Created comprehensive authorization middleware
2. Added test scripts for verifying role-based permissions
3. Documented token formats and expected authorization behavior

### Documentation References
- `/docs/auth/role-based-authorization.md` - Documentation of role-based access control
- `/docs/auth/testing-authorization.md` - Guide for testing authorization functionality
- `/docs/security/jwt-tokens.md` - Information on JWT token implementation

## Next Steps for Resolution

### For Server-Client Communication Issues
1. Complete API route mapping to identify all discrepancies
2. Update client code to use correct API paths
3. Ensure all API endpoints are properly registered and documented

### For PowerShell and Script Execution Issues
1. Consolidate scripts to minimize the number needed
2. Create comprehensive Windows setup documentation
3. Provide both PowerShell and batch alternatives for all operations

### For Port Conflicts
1. Implement automatic port selection with fallback options
2. Add better process management to startup scripts
3. Improve error messaging for port conflict scenarios

### For Module Resolution
1. Standardize path references across all scripts
2. Implement more robust dependency checking
3. Add clear error messages for path-related issues

### For Authorization Issues
1. Complete comprehensive testing of all secured endpoints
2. Document all role permissions in a central location
3. Implement automated authorization testing

## Related Documentation Files

- `/docs/README.md` - Overview of all documentation
- `/docs/CONTRIBUTING.md` - Guidelines for contributing to the project
- `/docs/TROUBLESHOOTING.md` - General troubleshooting procedures
- `/docs/windows/README.md` - Windows-specific documentation index
- `/docs/testing/README.md` - Testing documentation index 