@echo off
echo Setting environment variables and starting server...

REM Change to server directory
cd server

REM Set environment variables
SET JWT_SECRET=secure-jwt-secret-for-development
SET PORT=4000
SET NODE_ENV=development
SET MONGODB_URI=mongodb://localhost:27017/real-estate-platform

echo Environment variables set:
echo JWT_SECRET: [SET]
echo PORT: %PORT%
echo NODE_ENV: %NODE_ENV%
echo MONGODB_URI: %MONGODB_URI%

echo Starting server...
npm run dev

pause 