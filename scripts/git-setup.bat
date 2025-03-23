@echo off
echo ==============================================
echo Real Estate Platform - Git Setup
echo ==============================================

rem Check if Git is installed
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Git is not installed. Please install Git before running this script.
    exit /b 1
)

rem Initialize repository if .git doesn't exist
if not exist ".git" (
    echo Initializing Git repository...
    git init
    
    rem Set initial branch name (git 2.28+)
    for /f "tokens=3" %%i in ('git --version') do set git_version=%%i
    git branch -M main
) else (
    echo Git repository already initialized.
)

rem Configure .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo Creating global .gitignore file...
    (
        echo # Dependency directories
        echo node_modules/
        echo /.pnp
        echo .pnp.js
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Build outputs
        echo /dist
        echo /build
        echo /out
        echo.
        echo # Logs
        echo logs
        echo *.log
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # IDE and editor files
        echo /.idea
        echo /.vscode
        echo *.swp
        echo *.swo
        echo.
        echo # OS files
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Generated data
        echo /data
    ) > .gitignore
)

rem Check for existing remotes
git remote | findstr "origin" >nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo No remote 'origin' configured.
    echo To add a remote repository, use:
    echo git remote add origin ^<repository-url^>
    echo.
) else (
    echo Remote 'origin' already configured.
)

echo.
echo Git setup completed!
echo To complete setup, consider running the following commands:
echo   1. git add .
echo   2. git commit -m "Initial commit"
echo   3. git push -u origin main (if you've set up a remote)
echo.

pause 