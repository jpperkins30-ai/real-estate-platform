# Comprehensive Git Guide

This guide provides a detailed reference for using Git effectively in your development workflow, from basic commands to advanced techniques, troubleshooting, and best practices.

## Table of Contents

- [Basic Git Commands](#basic-git-commands)
- [Branch Management](#branch-management)
- [Remote Repository Operations](#remote-repository-operations)
- [Common Development Workflows](#common-development-workflows)
- [Troubleshooting Git Issues](#troubleshooting-git-issues)
- [Best Practices](#best-practices)
- [Advanced Git Techniques](#advanced-git-techniques)

## Basic Git Commands

### Repository Setup

```bash
# Initialize a new repository
git init

# Clone an existing repository
git clone https://github.com/username/repository.git

# Clone a specific branch
git clone -b branch-name https://github.com/username/repository.git
```

### Viewing Status and History

```bash
# Check repository status
git status

# View commit history
git log

# View commit history with condensed one-line format
git log --oneline

# View commit history with a graph of branches
git log --graph --oneline --all

# View changes in a specific commit
git show commit-hash

# View changes between commits
git diff commit-hash1 commit-hash2
```

### Staging and Committing Changes

```bash
# Add specific files to staging
git add filename.txt

# Add all changed files to staging
git add .

# Add only parts of files interactively
git add -p

# Commit staged changes
git commit -m "Descriptive commit message"

# Amend the most recent commit
git commit --amend -m "New commit message"
```

### Undoing Changes

```bash
# Discard changes in working directory for a specific file
git restore filename.txt

# Discard all changes in working directory
git restore .

# Unstage changes (keep changes in working directory)
git restore --staged filename.txt

# Revert a commit (creates a new commit that undoes changes)
git revert commit-hash

# Reset to a previous commit (caution: destructive)
git reset --hard commit-hash
```

## Branch Management

### Creating and Switching Branches

```bash
# List all branches
git branch

# List all branches including remote branches
git branch -a

# Create a new branch
git branch branch-name

# Create and switch to a new branch
git checkout -b branch-name

# Switch to an existing branch
git checkout branch-name

# Switch to the previous branch
git checkout -
```

### Merging Branches

```bash
# Merge a branch into current branch
git merge branch-name

# Merge with a commit message
git merge branch-name -m "Merge branch-name into main"

# Merge without fast-forward (always creates a merge commit)
git merge --no-ff branch-name
```

### Rebase Workflow

```bash
# Rebase current branch onto another branch
git rebase branch-name

# Interactive rebase for editing, squashing commits
git rebase -i HEAD~3  # Rebase last 3 commits
```

### Deleting Branches

```bash
# Delete a branch that has been merged
git branch -d branch-name

# Force delete a branch (even if not merged)
git branch -D branch-name

# Delete a remote branch
git push origin --delete branch-name
```

## Remote Repository Operations

### Managing Remotes

```bash
# List remote repositories
git remote -v

# Add a remote repository
git remote add origin https://github.com/username/repository.git

# Change remote URL
git remote set-url origin https://github.com/username/new-repository.git

# Remove a remote
git remote remove origin
```

### Fetching and Pulling

```bash
# Fetch updates from remote
git fetch origin

# Fetch updates and prune deleted branches
git fetch --prune

# Pull changes from remote (fetch + merge)
git pull origin branch-name

# Pull with rebase instead of merge
git pull --rebase origin branch-name
```

### Pushing Changes

```bash
# Push changes to remote
git push origin branch-name

# Push and set upstream branch
git push -u origin branch-name

# Force push (use with caution)
git push --force origin branch-name

# Force push more safely
git push --force-with-lease origin branch-name
```

### Working with Tags

```bash
# List all tags
git tag

# Create a lightweight tag
git tag v1.0.0

# Create an annotated tag
git tag -a v1.0.0 -m "Version 1.0.0"

# Push tags to remote
git push origin v1.0.0

# Push all tags
git push origin --tags
```

## Common Development Workflows

### Feature Branch Workflow

```bash
# Start a new feature
git checkout -b feature/new-feature develop

# Make changes and commit
git add .
git commit -m "Implement feature X"

# Push feature to remote for review
git push -u origin feature/new-feature

# After approval, merge back to develop
git checkout develop
git merge feature/new-feature
git push origin develop

# Clean up
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### Pull Request Workflow

1. Create a feature branch locally
2. Make changes and commit
3. Push branch to remote
4. Create a pull request on GitHub/GitLab/Bitbucket
5. After code review and approval, merge the PR
6. Pull the updated main/develop branch
7. Delete the feature branch

### Hotfix Workflow

```bash
# Create hotfix branch from production
git checkout -b hotfix/issue-fix main

# Fix the issue
git commit -m "Fix critical bug"

# Merge to both main and develop
git checkout main
git merge hotfix/issue-fix
git push origin main

git checkout develop
git merge hotfix/issue-fix
git push origin develop

# Clean up
git branch -d hotfix/issue-fix
```

## Troubleshooting Git Issues

### Common Error Messages and Solutions

#### "fatal: refusing to merge unrelated histories"

```bash
# Solution: force the merge if you're sure
git pull origin main --allow-unrelated-histories
```

#### "error: failed to push some refs"

```bash
# Solution: pull changes first
git pull --rebase origin branch-name
git push origin branch-name
```

#### "error: Your local changes would be overwritten by checkout"

```bash
# Solution 1: Commit your changes
git add .
git commit -m "Save changes before checkout"

# Solution 2: Stash your changes
git stash
git checkout other-branch
# Later restore changes
git stash pop
```

#### "fatal: not a git repository"

```bash
# Make sure you're in the correct directory
cd /path/to/git/repository
```

#### "fatal: cannot do a partial commit during a merge"

```bash
# Either commit all changes
git add .
git commit

# Or abort the merge
git merge --abort
```

### Resolving Merge Conflicts

1. When a conflict occurs:
   ```bash
   # Git will mark the file as conflicted
   # Edit the file manually to resolve conflicts
   git add resolved-file.txt
   git commit  # or git merge --continue
   ```

2. Using a merge tool:
   ```bash
   git mergetool
   ```

3. Abort a problematic merge:
   ```bash
   git merge --abort
   ```

### Recovering Lost Work

#### Recover Uncommitted Changes

```bash
# List stash entries
git stash list

# Apply most recent stash
git stash apply

# Apply specific stash
git stash apply stash@{2}

# Drop a stash when done
git stash drop stash@{2}
```

#### Recover Lost Commits

```bash
# Find dangling commits
git reflog

# Recover by creating a branch at that commit
git checkout -b recovery-branch commit-hash
```

#### Recover Deleted Branch

```bash
# Find the commit hash of the branch tip
git reflog

# Create a new branch at that commit
git checkout -b branch-name commit-hash
```

## Best Practices

### Commit Messages

1. Write descriptive commit messages in the imperative mood
   - Good: "Fix bug in user authentication flow"
   - Avoid: "Fixed bug" or "Fixing bug"

2. Follow a structured format:
   ```
   Short summary (50 chars or less)

   More detailed explanation if necessary. Wrap at around 72 
   characters. Explain what and why, not how.

   - Bullet points are okay
   - Use hyphens or asterisks

   Resolves: #123
   See also: #456, #789
   ```

3. Use conventional commits for systematic commit messages:
   - `feat:` - new feature
   - `fix:` - bug fix
   - `docs:` - documentation changes
   - `style:` - formatting, missing semicolons, etc.
   - `refactor:` - code restructuring without functionality changes
   - `test:` - adding tests
   - `chore:` - maintenance tasks

### Branching Strategy

1. Keep `main` or `master` branch always deployable
2. Use `develop` branch for ongoing development
3. Create feature branches from `develop`
4. Use naming conventions for branches:
   - `feature/feature-name`
   - `bugfix/issue-description`
   - `hotfix/urgent-fix`
   - `release/v1.2.0`

### Pull Request Practices

1. Keep PRs small and focused on a single issue
2. Include thorough descriptions
3. Reference related issues
4. Request relevant reviewers
5. Respond to feedback promptly

### General Workflow Tips

1. Pull before you push to avoid conflicts
2. Commit early and often
3. Use .gitignore for files that shouldn't be tracked
4. Don't commit generated files, dependencies, or credentials
5. Regularly clean up old branches

## Advanced Git Techniques

### Interactive Rebase

```bash
# Rebase interactively to clean up commits
git rebase -i HEAD~5

# Options in interactive rebase:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# d, drop = remove commit
```

### Cherry-Picking

```bash
# Apply changes from a specific commit to current branch
git cherry-pick commit-hash

# Cherry-pick without committing
git cherry-pick -n commit-hash
```

### Stashing

```bash
# Stash changes with a message
git stash save "Work in progress on feature X"

# Stash including untracked files
git stash -u

# Apply stash and remove from stash list
git stash pop

# Apply stash without removing it
git stash apply stash@{0}

# Create a branch from a stash
git stash branch new-branch stash@{0}
```

### Bisect for Bug Hunting

```bash
# Start a bisect session
git bisect start

# Mark the current version as bad
git bisect bad

# Mark a known good commit
git bisect good commit-hash

# Git will checkout commits for you to test
# After testing, mark as good or bad
git bisect good  # or git bisect bad

# When done, reset to original state
git bisect reset
```

### Submodules

```bash
# Add a submodule
git submodule add https://github.com/username/repository.git path/to/submodule

# Initialize submodules after cloning a repository
git submodule init
git submodule update

# Clone a repository with submodules
git clone --recurse-submodules https://github.com/username/repository.git
```

### Git Hooks

Git hooks are scripts that run automatically on certain events:

1. Create executable scripts in `.git/hooks/` directory
2. Common hooks:
   - `pre-commit`: Run before a commit is created
   - `prepare-commit-msg`: Prepare the commit message
   - `post-commit`: Run after a commit is created
   - `pre-push`: Run before pushing to a remote

### Advanced Configuration

```bash
# Set global username and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set repository-specific username and email
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Create aliases for common commands
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.unstage 'restore --staged'
```

## Git Resources

- [Official Git Documentation](https://git-scm.com/doc)
- [Git Book](https://git-scm.com/book)
- [GitHub Guides](https://guides.github.com/)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)

---

This guide covers the most common Git commands and workflows. For complex operations or specific use cases, consult the official Git documentation or reach out to your team's Git expert. 