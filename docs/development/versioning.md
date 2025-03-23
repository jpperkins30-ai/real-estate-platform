# Documentation Versioning

This guide explains how to manage different versions of the documentation.

## Version Structure

The documentation is organized by version in the following structure:

```
docs/
├── v1.0.0/           # Latest stable version
├── v0.9.0/           # Previous stable version
├── v0.8.0/           # Older version
└── _versions.json    # Version configuration
```

## Managing Versions

### Creating a New Version

1. Create a new version directory:
```bash
mkdir docs/v1.1.0
```

2. Copy the current documentation:
```bash
cp -r docs/v1.0.0/* docs/v1.1.0/
```

3. Update version information in `index.html`:
```javascript
versions: {
  'latest': 'v1.1.0',
  'v1.0.0': 'v1.0.0',
  'v0.9.0': 'v0.9.0',
  'v0.8.0': 'v0.8.0'
}
```

### Version Status

Use version badges to indicate the status of each version:

```markdown
# Feature Name <span class="version-badge stable">v1.0.0</span>
# New Feature <span class="version-badge beta">v1.1.0</span>
# Deprecated Feature <span class="version-badge deprecated">v0.8.0</span>
```

### Version-specific Content

When documenting version-specific features:

1. Use version tags:
```markdown
::: tip v1.0.0
This feature was introduced in version 1.0.0
:::

::: warning v0.8.0
This feature is deprecated in version 0.8.0
:::
```

2. Document breaking changes:
```markdown
## Breaking Changes

### v1.0.0
- Changed API endpoint structure
- Updated authentication method
- Removed deprecated features
```

## Best Practices

1. **Version Naming**
   - Use semantic versioning (MAJOR.MINOR.PATCH)
   - Keep version numbers consistent with the codebase

2. **Content Management**
   - Keep version-specific content in appropriate directories
   - Use version badges for feature status
   - Document breaking changes clearly

3. **Navigation**
   - Update sidebar navigation for each version
   - Maintain consistent structure across versions
   - Include version selector in all pages

4. **Search**
   - Configure search to work across all versions
   - Update search paths when adding new versions

## Deployment

### GitHub Pages

1. Update deployment workflow:
```yaml
jobs:
  deploy:
    steps:
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
          publish_branch: gh-pages
```

2. Configure version-specific URLs:
```
https://your-org.github.io/real-estate-platform/v1.0.0/
https://your-org.github.io/real-estate-platform/v0.9.0/
```

### Netlify

1. Update redirects in `netlify.toml`:
```toml
[[redirects]]
  from = "/v1.0.0/*"
  to = "/v1.0.0/index.html"
  status = 200
```

2. Configure build settings:
```toml
[build]
  command = "npm install -g docsify-cli && docsify serve docs"
  publish = "docs"
```

## Maintenance

1. **Regular Updates**
   - Review and update documentation monthly
   - Remove outdated versions
   - Update version badges

2. **Version Cleanup**
   - Archive old versions
   - Update version selector
   - Remove deprecated content

3. **Cross-version Links**
   - Use relative paths for internal links
   - Include version information in external links
   - Test all links across versions

## Troubleshooting

### Common Issues

1. **Version Selector Not Working**
   - Check version configuration in `index.html`
   - Verify version paths exist
   - Clear browser cache

2. **Search Across Versions**
   - Update search configuration
   - Verify file paths
   - Check search depth settings

3. **Broken Links**
   - Use relative paths
   - Update version-specific links
   - Test all links after updates 