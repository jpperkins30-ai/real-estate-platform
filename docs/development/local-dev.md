# Local Documentation Development

This guide will help you set up and run the documentation locally for development.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/real-estate-platform.git
cd real-estate-platform
```

2. Install docsify-cli globally:
```bash
npm install -g docsify-cli
```

## Running Locally

1. Start the documentation server:
```bash
docsify serve docs
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

The documentation will automatically reload when you make changes to any markdown files.

## Project Structure

```
docs/
├── _sidebar.md          # Sidebar navigation
├── index.html          # Main HTML file with configuration
├── README.md           # Homepage content
├── development/        # Development guides
├── features/          # Feature documentation
├── api/               # API documentation
├── deployment/        # Deployment guides
└── resources/         # Developer resources
```

## Writing Documentation

### Markdown Guidelines

1. Use headers for section organization:
   - `#` for page title
   - `##` for main sections
   - `###` for subsections

2. Code blocks:
   ```markdown
   ```typescript
   // Your code here
   ```
   ```

3. Links:
   ```markdown
   [Link text](path/to/file.md)
   ```

4. Images:
   ```markdown
   ![Alt text](path/to/image.png)
   ```

### Best Practices

1. Keep documentation up to date with code changes
2. Use clear and concise language
3. Include code examples where appropriate
4. Add screenshots for UI-related documentation
5. Test all links and code examples

## Testing Documentation

1. Check all links:
```bash
docsify-cli check docs
```

2. Validate markdown:
```bash
docsify-cli check docs --check-markdown
```

## Building for Production

1. Build static files:
```bash
docsify-cli build docs
```

2. Preview production build:
```bash
docsify-cli serve docs --build
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill the process using port 3000
   npx kill-port 3000
   # Then try serving again
   docsify serve docs
   ```

2. **Changes not reflecting**
   - Clear browser cache
   - Check file permissions
   - Verify file paths

3. **Search not working**
   - Ensure all markdown files are properly formatted
   - Check for special characters in file names
   - Verify search configuration in index.html

## Contributing

1. Create a new branch for your changes
2. Make your documentation updates
3. Test locally
4. Submit a pull request

## Additional Resources

- [Docsify Documentation](https://docsify.js.org/)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Markdown](https://docs.github.com/en/github/writing-on-github) 