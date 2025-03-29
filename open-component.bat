@echo off
setlocal enabledelayedexpansion

:: Default to inventory if no argument provided
set COMPONENT=inventory
if not "%~1"=="" set COMPONENT=%~1

:: Define component URLs
set "INVENTORY_URL=http://localhost:3000/inventory"
set "MAP_URL=http://localhost:3000/map"
set "WIZARD_URL=http://localhost:3000/wizard"
set "HEALTH_URL=http://localhost:4000/api/health"

:: Display header
echo Opening %COMPONENT% component...

:: Open the appropriate URL based on the component
if "%COMPONENT%"=="inventory" (
    echo URL: !INVENTORY_URL!
    start "" "!INVENTORY_URL!"
) else if "%COMPONENT%"=="map" (
    echo URL: !MAP_URL!
    start "" "!MAP_URL!"
) else if "%COMPONENT%"=="wizard" (
    echo URL: !WIZARD_URL!
    start "" "!WIZARD_URL!"
) else if "%COMPONENT%"=="health" (
    echo URL: !HEALTH_URL!
    start "" "!HEALTH_URL!"
) else (
    echo Invalid component: %COMPONENT%
    echo Valid options: inventory, map, wizard, health
    exit /b 1
)

echo.
echo Component opened in browser. Use TESTING-GUIDE.md for comprehensive testing instructions.
echo.
echo Usage: open-component.bat [inventory^|map^|wizard^|health] 