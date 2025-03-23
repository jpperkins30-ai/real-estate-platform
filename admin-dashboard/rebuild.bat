@echo off
cd %~dp0
echo =================================
echo Admin Dashboard Build and Deploy
echo =================================
echo.

echo 1. Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing dependencies. Please check error messages above.
    pause
    exit /b 1
)
echo Dependencies installed successfully.
echo.

echo 2. Building admin dashboard...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error building admin dashboard. Please check error messages above.
    pause
    exit /b 1
)
echo Admin dashboard built successfully.
echo.

echo 3. Checking if server is configured...
if not exist ..\server\.env (
    echo Warning: Server .env file not found. The admin dashboard might not be served correctly.
    echo Creating .env file in server directory...
    (
        echo PORT=3000
        echo MONGODB_URI=mongodb://localhost:27017/real-estate
        echo JWT_SECRET=your_strong_jwt_secret_key_change_in_production
        echo NODE_ENV=development
        echo SERVE_ADMIN_DASHBOARD=true
    ) > ..\server\.env
)

echo Admin dashboard is now ready to be served by the server.
echo Make sure the server is running with SERVE_ADMIN_DASHBOARD=true in its .env file.
echo.
echo You can access the admin dashboard at http://localhost:3000/admin
echo.
echo Press any key to exit...
pause > nul 