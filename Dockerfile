FROM node:18

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

# Set working directory
WORKDIR /app

# Start a bash shell when container runs
CMD ["/bin/bash"] 