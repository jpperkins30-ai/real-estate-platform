@echo off
echo Starting server with direct fix...
set JWT_SECRET=direct-fix-jwt-secret
set PORT=4000
set NODE_ENV=development
set MONGODB_URI=mongodb://localhost:27017/real-estate-platform

echo Environment variables set directly:
echo - JWT_SECRET: [SET]
echo - PORT: %PORT%
echo - NODE_ENV: %NODE_ENV%
echo - MONGODB_URI: %MONGODB_URI%

echo.
echo Starting server with ts-node...
npx ts-node -r tsconfig-paths/register --project tsconfig.json src/index.ts
pause
