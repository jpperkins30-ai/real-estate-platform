# Content Migration Guide

This guide explains how to migrate content between different versions of the documentation.

## Migration Process

### 1. Identify Changes

Before migrating content, identify the changes between versions:

```bash
# Compare two versions
diff -r docs/v1.0.0 docs/v0.9.0

# Generate a list of changed files
find docs/v1.0.0 -type f -exec md5sum {} \; > v1.0.0.md5
find docs/v0.9.0 -type f -exec md5sum {} \; > v0.9.0.md5
diff v1.0.0.md5 v0.9.0.md5
```

### 2. Version-specific Content

When migrating content, handle version-specific features:

```markdown
::: tip v1.0.0
New feature description
:::

::: warning v0.9.0
Deprecated feature description
:::
```

### 3. Breaking Changes

Document breaking changes clearly:

```markdown
## Breaking Changes

### v1.0.0
- Changed API endpoint structure
- Updated authentication method
- Removed deprecated features

### Migration Steps
1. Update API client configuration
2. Implement new authentication flow
3. Remove deprecated feature usage
```

## Migration Scripts

### Content Migration Script

```javascript
const fs = require('fs');
const path = require('path');

function migrateContent(sourceVersion, targetVersion) {
  const sourceDir = path.join('docs', sourceVersion);
  const targetDir = path.join('docs', targetVersion);

  // Copy content
  fs.cpSync(sourceDir, targetDir, { recursive: true });

  // Update version badges
  updateVersionBadges(targetDir, targetVersion);

  // Update internal links
  updateInternalLinks(targetDir, targetVersion);
}

function updateVersionBadges(dir, version) {
  // Update version badges in markdown files
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const updated = content.replace(
        /<span class="version-badge[^>]*>([^<]+)<\/span>/g,
        `<span class="version-badge stable">${version}</span>`
      );
      fs.writeFileSync(path.join(dir, file), updated);
    }
  });
}

function updateInternalLinks(dir, version) {
  // Update internal links to point to correct version
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const updated = content.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (match, text, link) => {
          if (link.startsWith('/')) {
            return `[${text}](${version}${link})`;
          }
          return match;
        }
      );
      fs.writeFileSync(path.join(dir, file), updated);
    }
  });
}
```

### Validation Script

```javascript
function validateMigration(sourceVersion, targetVersion) {
  // Check for broken links
  checkBrokenLinks(targetVersion);

  // Verify version badges
  verifyVersionBadges(targetVersion);

  // Validate markdown syntax
  validateMarkdown(targetVersion);
}

function checkBrokenLinks(version) {
  // Implementation for checking broken links
}

function verifyVersionBadges(version) {
  // Implementation for verifying version badges
}

function validateMarkdown(version) {
  // Implementation for validating markdown syntax
}
```

## Best Practices

### 1. Content Organization

- Keep version-specific content in appropriate directories
- Use consistent file naming across versions
- Maintain a clear directory structure

### 2. Version Control

- Use semantic versioning
- Tag releases in Git
- Keep version history in `_versions.json`

### 3. Documentation Updates

- Update all references to version numbers
- Review and update code examples
- Verify all links work correctly

### 4. Testing

- Test all pages in the new version
- Verify search functionality
- Check navigation between versions

## Common Issues

### 1. Broken Links

```markdown
# Before
[Link text](/path/to/file.md)

# After
[Link text](/v1.0.0/path/to/file.md)
```

### 2. Version-specific Features

```markdown
::: tip v1.0.0
New feature available in v1.0.0
:::

::: warning v0.9.0
Feature deprecated in v0.9.0
:::
```

### 3. Code Examples

```markdown
```typescript
// v1.0.0
const client = new Client({
  version: 'v1.0.0',
  // ...
});

// v0.9.0
const client = new Client({
  version: 'v0.9.0',
  // ...
});
```
```

## Migration Checklist

1. **Preparation**
   - [ ] Backup current documentation
   - [ ] Create new version directory
   - [ ] Update version configuration

2. **Content Migration**
   - [ ] Copy existing content
   - [ ] Update version badges
   - [ ] Update internal links
   - [ ] Add version-specific content

3. **Validation**
   - [ ] Check for broken links
   - [ ] Verify markdown syntax
   - [ ] Test search functionality
   - [ ] Validate navigation

4. **Deployment**
   - [ ] Update deployment configuration
   - [ ] Test in staging environment
   - [ ] Deploy to production
   - [ ] Monitor for issues

## Additional Resources

- [Version Management Script](../scripts/version-docs.js)
- [Documentation Structure](../_sidebar.md)
- [Deployment Guide](../deployment/production.md) 