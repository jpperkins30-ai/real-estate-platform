@echo off
echo Starting Claude Code in Docker...
echo Your files are available in the /app directory inside the container
echo.
docker run -it --rm -v %cd%:/app node:18 /bin/bash -c "npm install -g @anthropic-ai/claude-code && exec /bin/bash"
