@echo off
echo Setting up Real Estate Platform Server...
echo.

echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing dependencies. Please check your npm installation.
    exit /b 1
)
echo Dependencies installed successfully.
echo.

echo Checking for .env file...
if not exist .env (
    echo Creating default .env file...
    echo PORT=3000 > .env
    echo MONGODB_URI=mongodb://localhost:27017/real-estate >> .env
    echo JWT_SECRET=your_strong_jwt_secret_key_change_in_production >> .env
    echo NODE_ENV=development >> .env
    echo Default .env file created.
) else (
    echo .env file already exists.
)
echo.

echo Starting development server...
echo Press Ctrl+C to stop the server when needed.
echo.
call npm run dev 