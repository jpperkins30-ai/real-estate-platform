@echo off
echo Setting environment variables and starting server...

REM Set environment variables
set JWT_SECRET=secure-jwt-secret-for-development-only
set PORT=4000
set NODE_ENV=development
set MONGODB_URI=mongodb://localhost:27017/real-estate-platform

echo Environment variables set:
echo JWT_SECRET: [SET]
echo PORT: %PORT%
echo NODE_ENV: %NODE_ENV%
echo MONGODB_URI: %MONGODB_URI%

echo Starting server...
npm run dev

pause 