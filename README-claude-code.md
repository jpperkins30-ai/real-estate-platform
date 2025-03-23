# Claude Code for Windows

This setup allows you to use Claude Code on Windows through Docker, as Claude Code doesn't natively support Windows.

## Prerequisites

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) must be installed and running
2. PowerShell or Command Prompt (CMD)

## Running Claude Code

### Using PowerShell

```powershell
.\run-claude-code-all-in-one.ps1
```

### Using Command Prompt (CMD)

```
run-claude-code-all-in-one.bat
```

## Inside the Container

Once inside the container:

1. Your current directory is mounted to `/app` in the container
2. Claude Code will be automatically installed
3. Use the `claude` command to run Claude Code
4. Type `exit` to leave the container

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