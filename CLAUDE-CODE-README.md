# Claude Code for Windows

This setup allows you to use Claude Code on Windows through Docker, as Claude Code doesn't natively support Windows.

## Prerequisites

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) must be installed and running
2. PowerShell or Command Prompt (CMD)

## Setup Files

All necessary files are in this directory:
- `run-claude-code.ps1` - PowerShell script to run Claude Code (manual installation)
- `run-claude-code.bat` - Batch file to run Claude Code (manual installation)
- `run-claude-code-all-in-one.ps1` - PowerShell script with automatic installation (recommended)
- `run-claude-code-all-in-one.bat` - Batch file with automatic installation (recommended)

## Running Claude Code

### Recommended Method (All-in-One Scripts)

These scripts automatically install Claude Code for you:

```powershell
# For PowerShell
.\run-claude-code-all-in-one.ps1
```

```cmd
# For CMD
run-claude-code-all-in-one.bat
```

### Manual Installation Method

If you prefer to install Claude Code manually:

```powershell
# For PowerShell
.\run-claude-code.ps1
```

```cmd
# For CMD
run-claude-code.bat
```

Then once inside the container:
```bash
npm install -g @anthropic-ai/claude-code
```

## Using Claude Code

Once inside the container and with Claude Code installed:

1. Your current directory is mounted to `/app` in the container
2. Use the `claude` command to run Claude Code
3. Type `exit` to leave the container

## Example Usage

Inside the Docker container:

```bash
# Basic usage
claude "Explain how to use Claude Code"

# List available commands
claude --help

# Run in print mode (non-interactive)
claude -p "Generate a React component that displays a counter"
```

## Troubleshooting

- If Docker isn't running, start Docker Desktop
- If you encounter permission issues, run your terminal as Administrator
- If the container fails to start, check your internet connection
- If files aren't accessible in the container, make sure you're running the script from your project directory

## Notes

- Any changes made to files inside the container will be reflected in your Windows files
- The Docker container is temporary; it will be removed when you exit
- When using the manual installation scripts, you'll need to reinstall Claude Code each time you start a new container
- The all-in-one scripts handle the installation automatically each time 