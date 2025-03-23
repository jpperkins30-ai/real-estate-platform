@echo off
echo Creating backup of original properties.ts file...
copy src\routes\properties.ts src\routes\properties.ts.bak

echo Replacing properties.ts with fixed version...
copy src\routes\properties.direct.ts src\routes\properties.ts

echo Fix complete. You can now run 'npm run dev' to start the server.
echo If you need to restore the original file, run:
echo   copy src\routes\properties.ts.bak src\routes\properties.ts 