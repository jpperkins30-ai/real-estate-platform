# PowerShell script to run Claude Code in Docker with automatic installation
Write-Host "Starting Node.js container for Claude Code..."
Write-Host "Your files are available in the /app directory inside the container"
Write-Host "Claude Code will be installed automatically"
Write-Host "Type 'exit' to leave the container when done"
Write-Host ""

docker run -it --rm -v ${PWD}:/app node:18 /bin/bash -c "npm install -g @anthropic-ai/claude-code && exec /bin/bash" 