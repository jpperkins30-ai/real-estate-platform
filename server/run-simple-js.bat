@echo off
echo Starting simplified JavaScript server...

REM Set environment variables
set JWT_SECRET=simple-js-jwt-secret-for-development
set JWT_EXPIRES_IN=24h
set PORT=4000
set NODE_ENV=development
set MONGODB_URI=mongodb://localhost:27017/real-estate-platform

REM Display environment variables
echo Environment variables:
echo - JWT_SECRET: [SET]
echo - JWT_EXPIRES_IN: %JWT_EXPIRES_IN%
echo - PORT: %PORT%
echo - NODE_ENV: %NODE_ENV%
echo - MONGODB_URI: %MONGODB_URI%

REM Start the JavaScript server
echo.
echo Starting simplified JavaScript server...
node src/js-server.js

pause 