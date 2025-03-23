@echo off
REM Batch file to run Claude Code in Docker using the official Node.js image

echo Starting Node.js container for Claude Code...
echo Your files are available in the /app directory inside the container
echo After container starts:
echo 1. Run 'npm install -g @anthropic-ai/claude-code' to install Claude Code
echo 2. Use the 'claude' command to run Claude Code
echo 3. Type 'exit' to leave the container
echo.

docker run -it --rm -v %cd%:/app node:18 /bin/bash 