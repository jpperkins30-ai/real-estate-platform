# Role Authorization Demo for Real Estate Platform
Write-Host "Role Authorization Demo for Real Estate Platform" -ForegroundColor Cyan
Write-Host "This demo shows how role-based authorization works in our application" -ForegroundColor Yellow

# Store current directory
$rootDir = $PWD.Path
$serverDir = Join-Path -Path $rootDir -ChildPath "server"
$roleAuthPath = Join-Path -Path $serverDir -ChildPath "src\middleware\roleAuth.ts"

# Step 1: Show the role authorization middleware
Write-Host "`nStep 1: Overview of Role Authorization Middleware" -ForegroundColor Magenta
Write-Host "File: $roleAuthPath"

$roleAuthContent = @"
// This is the role authorization middleware implementation
export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip role check if no roles specified
    if (roles.length === 0) {
      return next();
    }

    // Get user from request (set by auth middleware)
    const user = req.user;

    // Check if user exists and has role
    if (!user) {
      return res.status(401).json({ 
        message: 'Unauthorized: Authentication required',
        success: false
      });
    }

    // Check if user role is in allowed roles
    if (roles.length && !roles.includes(user.role || '')) {
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions',
        success: false,
        requiredRoles: roles
      });
    }

    // User has required role, proceed
    next();
  };
};
"@

Write-Host $roleAuthContent -ForegroundColor Gray

# Step 2: Show examples of using the middleware
Write-Host "`nStep 2: How to use the middleware in routes" -ForegroundColor Magenta

$routeExamples = @"
// Example 1: Protected route for admin only
router.get('/admin/dashboard', authorize(['admin']), (req, res) => {
  res.json({ message: 'Admin dashboard accessed successfully' });
});

// Example 2: Route accessible by multiple roles
const EXPORT_ROLES = ['admin', 'analyst', 'dataManager'];
router.get('/api/export/properties/csv', authorize(EXPORT_ROLES), (req, res) => {
  res.json({ message: 'Export properties to CSV successful' });
});

// Example 3: Public route (no authorization)
router.get('/public/data', authorize([]), (req, res) => {
  res.json({ message: 'Public data accessed' });
});
"@

Write-Host $routeExamples -ForegroundColor Gray

# Step 3: Demo interactive authorization test
Write-Host "`nStep 3: Interactive Authorization Test" -ForegroundColor Magenta
Write-Host "This will show how different roles affect access to the export endpoint"

# Define available roles for testing
$roles = @{
    "admin" = "Full access to all features"
    "analyst" = "Can export and view reports"
    "dataManager" = "Can manage data but not admin features"
    "user" = "Basic user with limited access (should be denied)"
}

# Show roles
Write-Host "`nAvailable roles for testing:" -ForegroundColor Yellow
foreach ($role in $roles.Keys) {
    Write-Host "- $role : $($roles[$role])"
}

# Ask which role to test
$selectedRole = Read-Host "`nSelect a role to test (admin/analyst/dataManager/user)"

if (-not $roles.ContainsKey($selectedRole)) {
    Write-Host "Invalid role selected. Defaulting to 'user'" -ForegroundColor Red
    $selectedRole = "user"
}

# Create mock token for the selected role
$mockPayload = @{
    id = "test-$selectedRole-id"
    role = $selectedRole
    email = "$selectedRole@example.com"
    iat = 1625449120
} | ConvertTo-Json -Compress

# Base64 encoding for JWT parts (simplified for demo)
$mockHeader = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes('{"alg":"HS256","typ":"JWT"}'))
$mockPayloadEncoded = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($mockPayload))
$mockToken = "$mockHeader.$mockPayloadEncoded.signature-not-important-for-demo"

# Show the mock token
Write-Host "`nMock token for $selectedRole role:" -ForegroundColor Yellow
Write-Host $mockToken

# Simulate API request
Write-Host "`nTesting access to export endpoint with $selectedRole role..." -ForegroundColor Cyan

# Determine expected outcome
$hasAccess = $selectedRole -in @("admin", "analyst", "dataManager")
$endpoint = "/api/export/properties/csv"

if ($hasAccess) {
    Write-Host "`nREQUEST:" -ForegroundColor Gray
    Write-Host "GET $endpoint" -ForegroundColor Gray
    Write-Host "Authorization: Bearer $mockToken" -ForegroundColor Gray
    
    Write-Host "`nRESPONSE: 200 OK" -ForegroundColor Green
    $response = @{
        success = $true
        message = "Authorization successful"
        user = @{
            id = "test-$selectedRole-id"
            role = $selectedRole
            email = "$selectedRole@example.com"
        }
        data = @{
            format = "csv"
            type = "properties"
            count = 42
        }
    } | ConvertTo-Json -Depth 3
    
    Write-Host $response -ForegroundColor Gray
} else {
    Write-Host "`nREQUEST:" -ForegroundColor Gray
    Write-Host "GET $endpoint" -ForegroundColor Gray
    Write-Host "Authorization: Bearer $mockToken" -ForegroundColor Gray
    
    Write-Host "`nRESPONSE: 403 Forbidden" -ForegroundColor Red
    $response = @{
        success = $false
        message = "Forbidden: Insufficient permissions"
        requiredRoles = @("admin", "analyst", "dataManager")
    } | ConvertTo-Json
    
    Write-Host $response -ForegroundColor Gray
}

# Step 4: Explain authorization in overall application flow
Write-Host "`nStep 4: Authorization in Application Flow" -ForegroundColor Magenta

$flowExplanation = @"
1. Client sends request with JWT token in Authorization header
2. Auth middleware verifies token validity and sets user object on request
3. Role authorization middleware checks if user's role is in allowed roles
4. If authorized, request proceeds to the route handler
5. If unauthorized, 401 or 403 response is returned to the client
"@

Write-Host $flowExplanation -ForegroundColor Gray

# Conclusion
Write-Host "`nConclusion:" -ForegroundColor Cyan
Write-Host "The role authorization middleware provides a secure and flexible way to protect routes based on user roles."
Write-Host "It can be easily configured for different roles and integrated with any route in the application."
Write-Host "`nTo see it in action, run the server and test with different role tokens." 