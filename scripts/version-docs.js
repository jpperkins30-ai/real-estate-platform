const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const VERSIONS_FILE = path.join(DOCS_DIR, '_versions.json');

// Version management functions
function createVersion(version) {
  const versionDir = path.join(DOCS_DIR, version);
  
  // Create version directory
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true });
  }

  // Copy latest version content
  const latestVersion = getLatestVersion();
  if (latestVersion) {
    execSync(`cp -r ${path.join(DOCS_DIR, latestVersion)}/* ${versionDir}/`);
  }

  // Update versions configuration
  updateVersionsConfig(version);

  console.log(`Created version ${version}`);
}

function updateVersionsConfig(newVersion) {
  let versions = {};
  
  // Read existing versions
  if (fs.existsSync(VERSIONS_FILE)) {
    versions = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));
  }

  // Update versions
  versions[newVersion] = newVersion;
  versions.latest = newVersion;

  // Write back to file
  fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versions, null, 2));
}

function getLatestVersion() {
  if (fs.existsSync(VERSIONS_FILE)) {
    const versions = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));
    return versions.latest;
  }
  return null;
}

function archiveVersion(version) {
  const versionDir = path.join(DOCS_DIR, version);
  const archiveDir = path.join(DOCS_DIR, 'archived', version);

  // Create archive directory
  if (!fs.existsSync(path.join(DOCS_DIR, 'archived'))) {
    fs.mkdirSync(path.join(DOCS_DIR, 'archived'), { recursive: true });
  }

  // Move version to archive
  if (fs.existsSync(versionDir)) {
    fs.renameSync(versionDir, archiveDir);
    console.log(`Archived version ${version}`);
  }
}

function updateVersionBadges() {
  const versions = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));
  const latestVersion = versions.latest;

  // Update badges in all markdown files
  function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update version badges
    content = content.replace(
      /<span class="version-badge[^>]*>([^<]+)<\/span>/g,
      (match, version) => {
        const status = version === latestVersion ? 'stable' : 
                      version.startsWith('v1.') ? 'beta' : 'deprecated';
        return `<span class="version-badge ${status}">${version}</span>`;
      }
    );

    fs.writeFileSync(filePath, content);
  }

  // Process all markdown files
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.md')) {
        updateFile(filePath);
      }
    });
  }

  processDirectory(DOCS_DIR);
}

// CLI interface
const command = process.argv[2];
const version = process.argv[3];

switch (command) {
  case 'create':
    if (!version) {
      console.error('Please specify a version number');
      process.exit(1);
    }
    createVersion(version);
    break;

  case 'archive':
    if (!version) {
      console.error('Please specify a version number');
      process.exit(1);
    }
    archiveVersion(version);
    break;

  case 'update-badges':
    updateVersionBadges();
    break;

  default:
    console.log(`
Usage:
  node version-docs.js create <version>    Create a new version
  node version-docs.js archive <version>   Archive an existing version
  node version-docs.js update-badges       Update version badges
    `);
    process.exit(1);
} 