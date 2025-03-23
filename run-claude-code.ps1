# PowerShell script to run Claude Code in Docker using the official Node.js image
Write-Host "Starting Node.js container for Claude Code..."
Write-Host "Your files are available in the /app directory inside the container"
Write-Host "After container starts:"
Write-Host "1. Run 'npm install -g @anthropic-ai/claude-code' to install Claude Code"
Write-Host "2. Use the 'claude' command to run Claude Code"
Write-Host "3. Type 'exit' to leave the container"
Write-Host ""

docker run -it --rm -v ${PWD}:/app node:18 /bin/bash 