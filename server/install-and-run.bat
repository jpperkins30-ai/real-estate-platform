@echo off
cd %~dp0
echo ============================================
echo Real Estate Platform Server Setup and Runner
echo ============================================
echo.

echo Step 1: Checking for Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please download and install Node.js from https://nodejs.org/
    exit /b 1
)
node -v
echo.

echo Step 2: Checking for npm...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed or not in PATH.
    echo Please reinstall Node.js with npm included.
    exit /b 1
)
npm -v
echo.

echo Step 3: Installing or updating server dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing dependencies. Please check error messages above.
    pause
    exit /b 1
)
echo Server dependencies installed successfully.
echo.

echo Step 4: Creating .env file if needed...
if not exist .env (
    echo Creating default .env file...
    (
        echo PORT=3000
        echo MONGODB_URI=mongodb://localhost:27017/real-estate
        echo JWT_SECRET=your_strong_jwt_secret_key_change_in_production
        echo NODE_ENV=development
        echo SERVE_ADMIN_DASHBOARD=true
    ) > .env
    echo Default .env file created.
) else (
    echo .env file already exists. Skipping.
)
echo.

echo Step 5: Verifying project files...
if not exist src\index.ts (
    echo Error: src\index.ts not found. Check project structure.
    pause
    exit /b 1
)
if not exist tsconfig.json (
    echo Error: tsconfig.json not found. Check project structure.
    pause
    exit /b 1
)
echo Project structure looks good.
echo.

echo Step 6: Checking Admin Dashboard setup...
if exist ..\admin-dashboard\package.json (
    echo Admin Dashboard found.
    echo Would you like to build the Admin Dashboard too? (Y/N)
    set /p buildAdmin=
    if /i "%buildAdmin%"=="Y" (
        echo Building Admin Dashboard...
        cd ..\admin-dashboard
        call npm install
        if %ERRORLEVEL% neq 0 (
            echo Error installing Admin Dashboard dependencies.
            echo Continuing with server setup only.
        ) else (
            call npm run build
            if %ERRORLEVEL% neq 0 (
                echo Error building Admin Dashboard.
                echo Continuing with server setup only.
            ) else (
                echo Admin Dashboard built successfully.
            )
        )
        cd ..\server
    )
) else (
    echo Admin Dashboard not found. Continuing with server setup only.
)
echo.

echo Step 7: Starting the server...
echo API will be available at http://localhost:3000
echo API Documentation will be available at http://localhost:3000/api-docs
if "%SERVE_ADMIN_DASHBOARD%"=="true" (
    echo Admin Dashboard will be available at http://localhost:3000/admin
)
echo Press Ctrl+C to stop the server when needed.
echo.
call npm run dev

if %ERRORLEVEL% neq 0 (
    echo Server failed to start. See error messages above.
    pause
) 