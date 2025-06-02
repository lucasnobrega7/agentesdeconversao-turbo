#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read v0-components.json
const v0ComponentsPath = path.join(__dirname, '..', '..', '..', 'v0-components.json');
const v0Data = JSON.parse(fs.readFileSync(v0ComponentsPath, 'utf8'));

// Define which files should be merged vs replaced
const componentsToMerge = {
  // Component files - these should replace existing ones
  'components/dashboard/dashboard-header.tsx': 'replace',
  'components/dashboard/dashboard-nav.tsx': 'replace',
  'components/dashboard/mobile-nav.tsx': 'replace',
  'components/dashboard/user-nav.tsx': 'replace',
  'components/dashboard/organization-switcher.tsx': 'replace',
  'components/dashboard/notifications-dropdown.tsx': 'replace',
  'components/mode-toggle.tsx': 'replace',
  'components/auth/auth-header.tsx': 'replace',
  'components/public/public-header.tsx': 'replace',
  'components/public/public-footer.tsx': 'replace',
  'components/dashboard/overview.tsx': 'replace',
  'components/dashboard/recent-conversations.tsx': 'replace',
  
  // Layout files - these should be carefully merged
  'app/layout.tsx': 'skip', // Already exists with proper config
  'app/(dashboard)/layout.tsx': 'skip', // Already exists
  'app/(auth)/layout.tsx': 'skip', // Already exists
  'app/(public)/layout.tsx': 'create', // New layout
  
  // Page files - these should be created as new pages
  'app/(dashboard)/page.tsx': 'create-as-v0', // Save as dashboard-v0.tsx
  'app/(dashboard)/agents/page.tsx': 'create-as-v0', // Save as agents-v0.tsx
  'app/(dashboard)/agent-studio/page.tsx': 'create-as-v0', // Save as agent-studio-v0.tsx
};

// Process each file from v0.dev
v0Data.files.forEach(file => {
  // Adjust paths to use src/app instead of app
  let targetPath = file.target || file.path;
  const fileName = path.basename(targetPath);
  
  // Check our merge strategy
  const strategy = componentsToMerge[targetPath] || 'skip';
  
  if (strategy === 'skip') {
    console.log(`⏭️  Skipping: ${targetPath}`);
    return;
  }
  
  // Replace app/ with src/app/ for app directory files
  if (targetPath.startsWith('app/')) {
    targetPath = targetPath.replace('app/', 'src/app/');
  }
  
  // Handle create-as-v0 strategy
  if (strategy === 'create-as-v0') {
    const dir = path.dirname(targetPath);
    const ext = path.extname(targetPath);
    const baseName = path.basename(targetPath, ext);
    targetPath = path.join(dir, `${baseName}-v0${ext}`);
  }
  
  targetPath = path.join(__dirname, '..', 'apps', 'web', targetPath);
  const targetDir = path.dirname(targetPath);
  
  // Ensure directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`📁 Created directory: ${targetDir}`);
  }
  
  // Write the file
  let content = file.content;
  
  // Fix imports if needed
  if (targetPath.includes('components/')) {
    content = content.replace('@/components/theme-provider', '@/components/theme-provider');
  }
  
  fs.writeFileSync(targetPath, content);
  console.log(`✅ Written: ${targetPath}`);
});

console.log('\n📋 Summary:');
console.log(`Dependencies: ${v0Data.dependencies.join(', ')}`);
console.log(`\n💡 Next steps:`);
console.log(`1. Review the v0 component implementations`);
console.log(`2. Merge v0 dashboard pages with existing ones as needed`);
console.log(`3. Test the integrated components`);
console.log(`\n✨ v0.dev components merged successfully!`);