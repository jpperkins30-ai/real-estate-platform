@echo off
echo =====================================
echo Initializing Git Repository for Real Estate Platform
echo =====================================
echo.

REM Initialize Git if not already done
git init

REM Add all files to staging
echo Adding all files to staging...
git add .

REM Commit changes
echo Making initial commit...
git commit -m "Initial commit with all project files"

echo.
echo =====================================
echo Git initialization completed!
echo All files have been added and committed.
echo =====================================

pause 