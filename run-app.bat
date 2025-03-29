@echo off
echo Starting Real Estate Platform...

:: Check if server directory exists
if not exist "server" (
    echo Error: Server directory not found
    exit /b 1
)

:: Check if client directory exists
if not exist "client" (
    echo Error: Client directory not found
    exit /b 1
)

:: Start the server in a new window
echo Starting server...
start cmd /k "cd server && npm run dev"

:: Give the server time to start
echo Waiting for server to initialize (5 seconds)...
timeout /t 5 /nobreak > nul

:: Start the client in a new window
echo Starting client...
start cmd /k "cd client && npm start"

echo Application started in separate windows!
echo Use open-component.bat to test specific components

echo ======================================
echo Application URLs:
echo ======================================
echo Backend API: http://localhost:4000
echo Frontend UI: http://localhost:5173
echo Swagger API Docs: http://localhost:4000/api-docs
echo.

echo Application started successfully!
echo To stop the application, close the command windows. 