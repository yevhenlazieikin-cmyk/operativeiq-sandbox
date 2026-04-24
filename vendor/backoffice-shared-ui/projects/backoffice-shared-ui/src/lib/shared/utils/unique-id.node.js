const fs = require('fs');
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');

const configArgIndex = process.argv.indexOf('--config');
const externalConfig = configArgIndex !== -1
  ? JSON.parse(fs.readFileSync(path.resolve(process.argv[configArgIndex + 1]), 'utf8'))
  : {};

const targetDirs = [
  ...(externalConfig.targetDirs ?? [])
].map(dir => path.resolve(dir));

// List of files and directories to skip
const pathsToSkip = [
  ...(externalConfig.pathsToSkip ?? [])
].map(dir => path.resolve(dir));

const DEFAULT_ELEMENTS_TO_TARGET = [
  // Native interactive elements
  'button',
  'input',
  'select',
  'textarea',
  'a',
  'form',
  // Shared-ui components used outside the library
  'bo-grid',
  'bo-details-panel',
  'bo-action-buttons-panel',
  'bo-action-button-sub-panel',
  'bo-slide-toggle',
  'bo-date-picker',
  'bo-time-picker',
  'bo-tabber',
  'bo-search-dropdown',
  'bo-submission-panel',
  'bo-expand-collapse-toggle',
  'bo-comments-panel',
  'bo-quick-filters-panel',
  'bo-text-area-control',
  'app-file-uploader'
];
const elementsToTarget = [
  ...DEFAULT_ELEMENTS_TO_TARGET,
  ...(externalConfig.elementsToTarget ?? [])
];

function shouldSkip(filePath) {
  return pathsToSkip.some(skipPath => filePath.startsWith(skipPath));
}

function generateShortUuid() {
  return uuidv4().replace(/-/g, '').substring(0, 10);
}

function processFile(filePath) {
  if (shouldSkip(filePath)) {
    console.log(`Skipping ${filePath}`);
    return;
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    let modifiedData = data;

    elementsToTarget.forEach(tag => {
      const regex = new RegExp(`<${tag}(\\s[^>]*?)?>`, 'gi');
      modifiedData = modifiedData.replace(regex, (match, p1) => {
        if (p1 && (/id\s*=\s*["'].*?["']/.test(p1) || /\[id\]\s*=\s*["'].*?["']/.test(p1))) {
          return match;  // If ID or [id] binding already exists, return the match unchanged
        } else {
          const id = ` id="${generateShortUuid()}"`;
          return match.replace(`<${tag}`, `<${tag}${id}`);
        }
      });
    });

    // Add IDs to elements with Angular event listeners
    const eventListeners = ['click', 'change', 'input', 'submit', 'keydown', 'keyup'];
    eventListeners.forEach(event => {
      const regex = new RegExp(`<(\\w+)(\\s[^>]*?\\(${event}\\)\\s*=[^>]+?)>`, 'gi');
      modifiedData = modifiedData.replace(regex, (match, tag, p1) => {
        if (p1 && (/id\s*=\s*["'].*?["']/.test(p1) || /\[id\]\s*=\s*["'].*?["']/.test(p1))) {
          return match;  // If ID or [id] binding already exists, return the match unchanged
        } else {
          const id = ` id="${generateShortUuid()}"`;
          return match.replace(`<${tag}`, `<${tag}${id}`);
        }
      });
    });

    // Add IDs to elements with routerLink attribute
    const routerLinkRegex = new RegExp(`<(\\w+)(\\s[^>]*?routerLink\\s*=[^>]+?)>`, 'gi');
    modifiedData = modifiedData.replace(routerLinkRegex, (match, tag, p1) => {
      if (p1 && (/id\s*=\s*["'].*?["']/.test(p1) || /\[id\]\s*=\s*["'].*?["']/.test(p1))) {
        return match;  // If ID or [id] binding already exists, return the match unchanged
      } else {
        const id = ` id="${generateShortUuid()}"`;
        return match.replace(`<${tag}`, `<${tag}${id}`);
      }
    });

    fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${filePath}:`, err);
      } else {
        console.log(`Modified ${filePath}`);
        try {
          execSync(`git add "${filePath}"`);
        } catch (e) {
          console.error(`Error staging ${filePath}:`, e.message);
        }
      }
    });
  });
}

function getChangedFiles() {
  try {
    // Get modified, added, and untracked HTML files via git status
    const output = execSync('git status --porcelain', { encoding: 'utf8' });
    return output
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        // Format: "XY filename" or "XY old -> new" for renames
        const filePart = line.slice(3).trim();
        const filePath = filePart.includes(' -> ') ? filePart.split(' -> ')[1] : filePart;
        return path.resolve(filePath);
      })
      .filter(filePath => path.extname(filePath).toLowerCase() === '.html');
  } catch (e) {
    console.error('Error getting git status:', e.message);
    return [];
  }
}

function processDirectory(dir) {
  if (shouldSkip(dir)) {
    console.log(`Skipping directory ${dir}`);
    return;
  }

  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        processDirectory(filePath);
      } else if (file.isFile() && path.extname(file.name).toLowerCase() === '.html') {
        processFile(filePath);
      }
    });
  });
}

const changedOnly = process.argv.includes('--changed');

if (changedOnly) {
  const changedFiles = getChangedFiles().filter(
    filePath => targetDirs.some(dir => filePath.startsWith(dir)) && !shouldSkip(filePath)
  );

  if (changedFiles.length === 0) {
    console.log('No changed or new HTML files found.');
  } else {
    changedFiles.forEach(processFile);
  }
} else {
  targetDirs.forEach(dir => processDirectory(dir));
}
