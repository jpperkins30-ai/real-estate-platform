@echo off
echo =====================================================
echo Real Estate Platform - Simple POC Runner
echo =====================================================

echo Checking for required packages...
call npm install axios cheerio fs-extra path typescript ts-node dotenv
call npm install @types/node @types/cheerio @types/fs-extra --save-dev

echo Creating output directories...
mkdir data\raw 2>nul
mkdir data\processed 2>nul
mkdir data\reports 2>nul

echo Running POC...
call npx ts-node src/simple-poc.ts

echo POC execution completed.
echo Check the 'data' directory for results:
echo   - Raw data: data\raw\
echo   - Processed data: data\processed\
echo   - Reports: data\reports\

pause 