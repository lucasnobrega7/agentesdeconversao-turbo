#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read v0-components.json
const v0ComponentsPath = path.join(__dirname, '..', '..', '..', 'v0-components.json');
const v0Data = JSON.parse(fs.readFileSync(v0ComponentsPath, 'utf8'));

// Create necessary directories
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Process each file from v0.dev
v0Data.files.forEach(file => {
  // Adjust paths to use src/app instead of app
  let targetPath = file.target || file.path;
  
  // Replace app/ with src/app/ for app directory files
  if (targetPath.startsWith('app/')) {
    targetPath = targetPath.replace('app/', 'src/app/');
  }
  
  targetPath = path.join(__dirname, '..', 'apps', 'web', targetPath);
  const targetDir = path.dirname(targetPath);
  
  // Skip if it's a page.tsx or layout.tsx file that might conflict
  const fileName = path.basename(targetPath);
  if ((fileName === 'page.tsx' || fileName === 'layout.tsx') && fs.existsSync(targetPath)) {
    console.log(`⏭️  Skipping existing route file: ${targetPath}`);
    return;
  }
  
  // Ensure directory exists
  ensureDir(targetDir);
  
  // Adjust imports in the content
  let content = file.content;
  
  // Fix theme provider import
  content = content.replace('@/components/theme-provider', '@/components/theme-provider');
  
  // Check if file already exists
  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  File already exists: ${targetPath}`);
    // Create backup
    const backupPath = `${targetPath}.backup-${Date.now()}`;
    fs.copyFileSync(targetPath, backupPath);
    console.log(`   Created backup: ${backupPath}`);
  }
  
  // Write the file
  fs.writeFileSync(targetPath, content);
  console.log(`✅ Written: ${targetPath}`);
});

console.log('\n📋 Summary:');
console.log(`Dependencies required: ${v0Data.dependencies.join(', ')}`);
console.log(`Registry dependencies: ${v0Data.registryDependencies.join(', ')}`);
console.log(`\n✨ v0.dev components implementation complete!`);