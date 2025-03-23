@echo off
echo Deep Cleaning and Reinstalling Client...
echo.

cd client
echo Removing node_modules folder...
rmdir /s /q node_modules
echo.

echo Removing package-lock.json...
del /f package-lock.json
echo.

echo Reinstalling all dependencies...
call npm install
echo.

echo Verifying Vite installation...
call npm list vite
echo.

echo Creating a direct start.bat file...
echo @echo off > start.bat
echo echo Starting React App with Vite... >> start.bat
echo call npm run dev >> start.bat
echo. >> start.bat

echo Installation complete.
echo You can now run the client by using "npm run dev" or "start.bat" in the client directory.
echo.
pause 