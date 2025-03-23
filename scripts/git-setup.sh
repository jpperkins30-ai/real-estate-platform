#!/bin/bash
# Git setup script for Real Estate Platform

# Print banner
echo "=============================================="
echo "Real Estate Platform - Git Setup"
echo "=============================================="

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "Error: Git is not installed. Please install Git before running this script."
    exit 1
fi

# Initialize repository if .git doesn't exist
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    
    # Set initial branch name (git 2.28+)
    git_version=$(git --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    if [ "$(printf '%s\n' "2.28" "$git_version" | sort -V | head -n1)" = "2.28" ]; then
        git branch -M main
    fi
else
    echo "Git repository already initialized."
fi

# Configure .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "Creating global .gitignore file..."
    cat > .gitignore << EOL
# Dependency directories
node_modules/
/.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
/dist
/build
/out

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE and editor files
/.idea
/.vscode
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Generated data
/data
EOL
fi

# Check for existing remotes
if ! git remote | grep -q "origin"; then
    echo ""
    echo "No remote 'origin' configured."
    echo "To add a remote repository, use:"
    echo "git remote add origin <repository-url>"
    echo ""
else
    echo "Remote 'origin' already configured."
fi

echo ""
echo "Git setup completed!"
echo "To complete setup, consider running the following commands:"
echo "  1. git add ."
echo "  2. git commit -m 'Initial commit'"
echo "  3. git push -u origin main (if you've set up a remote)"
echo "" 