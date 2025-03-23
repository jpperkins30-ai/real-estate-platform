@echo off
REM Batch file to run Claude Code in Docker with automatic installation

echo Starting Node.js container for Claude Code...
echo Your files are available in the /app directory inside the container
echo Claude Code will be installed automatically
echo Type 'exit' to leave the container when done
echo.

docker run -it --rm -v %cd%:/app node:18 /bin/bash -c "npm install -g @anthropic-ai/claude-code && exec /bin/bash" 