# Git Setup and Backup Guide

This guide provides instructions on how to set up Git for the Real Estate Platform project and perform backups using the provided scripts.

## Initial Git Setup

Before using the backup scripts, you need to initialize Git and add all project files:

### Using Scripts

1. **For Windows CMD:**
   ```
   initialize-git.bat
   ```

2. **For Windows PowerShell:**
   ```
   PowerShell -ExecutionPolicy Bypass -File .\initialize-git.ps1
   ```

### Manual Setup

If the scripts don't work, you can run these commands manually:

```bash
# Initialize Git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit with all project files"
```

## Creating Backups

After initializing Git, you can create backups whenever needed:

### Using Scripts

1. **For Windows CMD:**
   ```
   create-backup.bat
   ```

2. **For Windows PowerShell:**
   ```
   PowerShell -ExecutionPolicy Bypass -File .\create-backup.ps1
   ```

### Manual Backup

If the scripts don't work, you can create backups manually:

```bash
# Create a new branch with timestamp (replace YYYY-MM-DD with current date)
git checkout -b backup-manual-YYYY-MM-DD

# Add all files
git add .

# Commit changes
git commit -m "Manual backup created on YYYY-MM-DD"

# Return to main branch
git checkout main
```

## Restoring from Backups

To restore from a backup:

1. List all backup branches:
   ```
   git branch
   ```

2. Checkout the desired backup branch:
   ```
   git checkout backup-YYYY-MM-DD-HHMMSS
   ```

3. Create a new branch from this backup if you want to work on it:
   ```
   git checkout -b restored-from-backup
   ```

## Troubleshooting

### "Not a git repository" error
If you see this error, you need to run the initialization script or commands first.

### "The token '&&' is not a valid statement separator" error in PowerShell
PowerShell uses `;` instead of `&&` for command chaining:
```
# Instead of:
cd server && npm run dev

# Use:
cd server; npm run dev
```

### "Permission denied" errors
Try running the terminal as Administrator or use the `-ExecutionPolicy Bypass` flag with PowerShell.

### Git not found
Ensure Git is installed and added to your system PATH.

## Best Practices

1. Create backups before and after significant changes
2. Use descriptive commit messages
3. Keep your repository clean by adding appropriate files to `.gitignore`
4. Regularly push your changes to a remote repository (GitHub, GitLab, etc.)
5. Document your changes in commit messages 