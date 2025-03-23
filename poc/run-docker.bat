@echo off
echo ==============================================
echo Real Estate Platform POC - Docker Runner
echo ==============================================

rem Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not installed. Please install Docker before running this script.
    exit /b 1
)

rem Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker Compose is not installed. Please install Docker Compose before running this script.
    exit /b 1
)

rem Create data directories if they don't exist
mkdir data\raw 2>nul
mkdir data\processed 2>nul
mkdir data\reports 2>nul

rem Build and start the container
echo Building and starting Docker container...
docker-compose up --build

echo.
echo POC execution completed.
echo Results are stored in the 'data' directory:
echo   - Raw data: data\raw\
echo   - Processed data: data\processed\
echo   - Reports: data\reports\

pause 