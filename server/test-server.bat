@echo off
echo Starting server for testing...

REM Set environment variables
set JWT_SECRET=test-jwt-secret-for-development-only
set PORT=4000
set NODE_ENV=development
set MONGODB_URI=mongodb://localhost:27017/real-estate-platform

REM Display current settings
echo Environment variables:
echo - JWT_SECRET: [SET]
echo - PORT: %PORT%
echo - NODE_ENV: %NODE_ENV%
echo - MONGODB_URI: %MONGODB_URI%

REM Start the server with the original index.ts
echo.
echo Starting server with ts-node...
npx ts-node -r tsconfig-paths/register src/index.ts

pause 