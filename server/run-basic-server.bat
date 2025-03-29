@echo off
echo Starting basic server...

REM Set environment variables
set JWT_SECRET=basic-jwt-secret-for-development-only
set PORT=4000
set NODE_ENV=development
set MONGODB_URI=mongodb://localhost:27017/real-estate-platform

REM Display current settings
echo Environment variables:
echo - JWT_SECRET: [SET]
echo - PORT: %PORT%
echo - NODE_ENV: %NODE_ENV%
echo - MONGODB_URI: %MONGODB_URI%

REM Start the server with ts-node
echo.
echo Starting server with ts-node...
npx ts-node -r tsconfig-paths/register --project tsconfig.json ./src/index.minimal.ts

pause 