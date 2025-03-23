@echo off
echo Starting Real Estate Platform...
echo.

echo ======================================
echo Step 1: Starting the backend server
echo ======================================
start cmd /k "cd server && npm run dev"
echo Server starting on http://localhost:4000
echo.

timeout /t 5 /nobreak

echo ======================================
echo Step 2: Starting the frontend client
echo ======================================
start cmd /k "cd client && npm run dev"
echo Client starting on http://localhost:5173
echo.

echo ======================================
echo Application URLs:
echo ======================================
echo Backend API: http://localhost:4000
echo Frontend UI: http://localhost:5173
echo Swagger API Docs: http://localhost:4000/api-docs
echo.

echo Application started successfully!
echo To stop the application, close the command windows. 