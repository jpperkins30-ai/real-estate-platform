@echo off
echo =====================================
echo Creating Git Backup for Real Estate Platform
echo =====================================
echo.

REM Check if Git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
)

REM Check current status
echo Checking current status...
git status

REM Create a backup branch with timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "year=%dt:~0,4%"
set "month=%dt:~4,2%"
set "day=%dt:~6,2%"
set "hour=%dt:~8,2%"
set "minute=%dt:~10,2%"
set "second=%dt:~12,2%"
set "timestamp=%year%-%month%-%day%-%hour%%minute%%second%"
set "branchName=backup-%timestamp%"

echo Creating backup branch: %branchName%
git checkout -b %branchName%

REM Add all files
echo Adding all files to staging...
git add .

REM Commit changes
echo Committing changes...
git commit -m "Backup created on %timestamp% after admin dashboard troubleshooting"

REM Return to original branch
echo Returning to main branch...
git checkout main -f

echo.
echo =====================================
echo Backup completed successfully!
echo Backup branch: %branchName%
echo To restore this backup, use: git checkout %branchName%
echo =====================================

pause 