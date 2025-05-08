const fs = require('fs-extra');
const path = require('path');

// Define paths
const webDir = path.join(__dirname, 'web');
const distDir = path.join(__dirname, 'dist');

// Ensure the dist directory exists
fs.ensureDirSync(distDir);

// Copy web assets to dist folder
console.log('Copying web assets to dist folder...');
fs.copySync(webDir, distDir, { overwrite: true });

console.log('Web assets copied successfully!');
