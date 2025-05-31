#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function findPackageJsonFiles(rootDir) {
  const packageFiles = [];
  
  function traverse(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && item !== 'node_modules' && !item.startsWith('.')) {
        traverse(fullPath);
      } else if (item === 'package.json' && !dir.includes('node_modules')) {
        packageFiles.push(fullPath);
      }
    }
  }
  
  traverse(rootDir);
  return packageFiles;
}

function analyzePackage(packagePath) {
  try {
    const content = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const relativePath = path.relative(process.cwd(), packagePath);
    
    return {
      name: content.name || path.basename(path.dirname(packagePath)),
      version: content.version,
      path: relativePath,
      dependencies: content.dependencies || {},
      devDependencies: content.devDependencies || {},
      peerDependencies: content.peerDependencies || {},
      workspaceDependencies: findWorkspaceDependencies(content),
      scripts: content.scripts || {},
      private: content.private || false
    };
  } catch (error) {
    console.error(`Error parsing ${packagePath}:`, error.message);
    return null;
  }
}

function findWorkspaceDependencies(packageJson) {
  const workspaceDeps = {};
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies
  };
  
  for (const [name, version] of Object.entries(allDeps)) {
    if (version.startsWith('workspace:') || name.startsWith('@agentes/') || name.startsWith('flowise')) {
      workspaceDeps[name] = version;
    }
  }
  
  return workspaceDeps;
}

function detectCircularDependencies(packages) {
  const graph = {};
  const packageNames = {};
  
  // Build name mapping
  packages.forEach(pkg => {
    packageNames[pkg.name] = pkg;
    graph[pkg.name] = [];
  });
  
  // Build dependency graph
  packages.forEach(pkg => {
    Object.keys(pkg.workspaceDependencies).forEach(depName => {
      if (packageNames[depName]) {
        graph[pkg.name].push(depName);
      }
    });
  });
  
  // Detect cycles using DFS
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];
  
  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push([...path.slice(cycleStart), node]);
      return;
    }
    
    if (visited.has(node)) return;
    
    visited.add(node);
    recursionStack.add(node);
    path.push(node);
    
    (graph[node] || []).forEach(neighbor => {
      dfs(neighbor, [...path]);
    });
    
    recursionStack.delete(node);
  }
  
  Object.keys(graph).forEach(node => {
    if (!visited.has(node)) {
      dfs(node);
    }
  });
  
  return cycles;
}

function analyzeVersionMismatches(packages) {
  const dependencyVersions = {};
  const mismatches = [];
  
  packages.forEach(pkg => {
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    };
    
    Object.entries(allDeps).forEach(([name, version]) => {
      if (!dependencyVersions[name]) {
        dependencyVersions[name] = {};
      }
      if (!dependencyVersions[name][version]) {
        dependencyVersions[name][version] = [];
      }
      dependencyVersions[name][version].push(pkg.name);
    });
  });
  
  Object.entries(dependencyVersions).forEach(([depName, versions]) => {
    const versionCount = Object.keys(versions).length;
    if (versionCount > 1) {
      mismatches.push({
        dependency: depName,
        versions: versions
      });
    }
  });
  
  return mismatches;
}

function analyzeCoupling(packages) {
  const packageNames = packages.map(p => p.name);
  const coupling = {};
  
  packages.forEach(pkg => {
    coupling[pkg.name] = {
      dependsOn: [],
      dependedBy: [],
      externalDeps: 0,
      totalDeps: 0
    };
    
    // Count dependencies
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };
    
    Object.keys(allDeps).forEach(depName => {
      if (packageNames.includes(depName)) {
        coupling[pkg.name].dependsOn.push(depName);
      } else {
        coupling[pkg.name].externalDeps++;
      }
      coupling[pkg.name].totalDeps++;
    });
  });
  
  // Calculate dependedBy relationships
  packages.forEach(pkg => {
    coupling[pkg.name].dependsOn.forEach(depName => {
      if (coupling[depName]) {
        coupling[depName].dependedBy.push(pkg.name);
      }
    });
  });
  
  return coupling;
}

function generateReport(packages) {
  console.log(`${colors.bold}${colors.cyan}=== MONOREPO DEPENDENCY ANALYSIS REPORT ===${colors.reset}\n`);
  
  // Overview
  console.log(`${colors.bold}${colors.green}📋 OVERVIEW${colors.reset}`);
  console.log(`Total packages: ${packages.length}`);
  console.log(`Workspace packages: ${packages.filter(p => p.name.startsWith('@agentes/') || p.name.startsWith('flowise')).length}`);
  console.log(`Private packages: ${packages.filter(p => p.private).length}\n`);
  
  // Package List
  console.log(`${colors.bold}${colors.blue}📦 PACKAGES${colors.reset}`);
  packages.forEach(pkg => {
    const workspaceDepsCount = Object.keys(pkg.workspaceDependencies).length;
    const hasWorkspaceDeps = workspaceDepsCount > 0 ? `${colors.green}(${workspaceDepsCount} workspace deps)${colors.reset}` : '';
    console.log(`  • ${colors.bold}${pkg.name}${colors.reset} v${pkg.version} ${hasWorkspaceDeps}`);
    console.log(`    📁 ${pkg.path}`);
  });
  console.log();
  
  // Workspace Dependencies
  console.log(`${colors.bold}${colors.magenta}🔗 WORKSPACE DEPENDENCIES${colors.reset}`);
  packages.forEach(pkg => {
    const workspaceDeps = Object.keys(pkg.workspaceDependencies);
    if (workspaceDeps.length > 0) {
      console.log(`  ${colors.bold}${pkg.name}${colors.reset} depends on:`);
      workspaceDeps.forEach(dep => {
        console.log(`    └── ${dep} (${pkg.workspaceDependencies[dep]})`);
      });
    }
  });
  console.log();
  
  // Circular Dependencies
  console.log(`${colors.bold}${colors.red}🔄 CIRCULAR DEPENDENCY ANALYSIS${colors.reset}`);
  const cycles = detectCircularDependencies(packages);
  if (cycles.length === 0) {
    console.log(`  ${colors.green}✅ No circular dependencies detected${colors.reset}`);
  } else {
    console.log(`  ${colors.red}❌ Found ${cycles.length} circular dependency chains:${colors.reset}`);
    cycles.forEach((cycle, index) => {
      console.log(`    ${index + 1}. ${cycle.join(' → ')}`);
    });
  }
  console.log();
  
  // Version Mismatches
  console.log(`${colors.bold}${colors.yellow}⚠️  VERSION MISMATCH ANALYSIS${colors.reset}`);
  const mismatches = analyzeVersionMismatches(packages);
  if (mismatches.length === 0) {
    console.log(`  ${colors.green}✅ No version mismatches found${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}Found ${mismatches.length} dependencies with version mismatches:${colors.reset}`);
    mismatches.forEach(mismatch => {
      console.log(`    ${colors.bold}${mismatch.dependency}${colors.reset}:`);
      Object.entries(mismatch.versions).forEach(([version, packages]) => {
        console.log(`      ${version} → ${packages.join(', ')}`);
      });
    });
  }
  console.log();
  
  // Coupling Analysis
  console.log(`${colors.bold}${colors.cyan}🔗 COUPLING ANALYSIS${colors.reset}`);
  const coupling = analyzeCoupling(packages);
  
  // Most coupled packages (high fan-in)
  const mostDepended = Object.entries(coupling)
    .sort((a, b) => b[1].dependedBy.length - a[1].dependedBy.length)
    .slice(0, 5);
  
  if (mostDepended.length > 0) {
    console.log(`  ${colors.bold}Most depended upon packages (high fan-in):${colors.reset}`);
    mostDepended.forEach(([name, data]) => {
      if (data.dependedBy.length > 0) {
        console.log(`    ${name}: ${data.dependedBy.length} packages depend on it`);
        console.log(`      └── ${data.dependedBy.join(', ')}`);
      }
    });
  }
  console.log();
  
  // Most dependent packages (high fan-out)
  const mostDependencies = Object.entries(coupling)
    .sort((a, b) => b[1].dependsOn.length - a[1].dependsOn.length)
    .slice(0, 5);
  
  if (mostDependencies.length > 0) {
    console.log(`  ${colors.bold}Most dependent packages (high fan-out):${colors.reset}`);
    mostDependencies.forEach(([name, data]) => {
      if (data.dependsOn.length > 0) {
        console.log(`    ${name}: depends on ${data.dependsOn.length} internal packages`);
        console.log(`      └── ${data.dependsOn.join(', ')}`);
      }
    });
  }
  console.log();
  
  // External dependency analysis
  console.log(`${colors.bold}${colors.blue}🌐 EXTERNAL DEPENDENCY ANALYSIS${colors.reset}`);
  const externalDeps = Object.entries(coupling)
    .sort((a, b) => b[1].externalDeps - a[1].externalDeps);
  
  externalDeps.forEach(([name, data]) => {
    const ratio = data.totalDeps > 0 ? (data.externalDeps / data.totalDeps * 100).toFixed(1) : 0;
    console.log(`  ${name}: ${data.externalDeps} external deps (${ratio}% of total)`);
  });
  console.log();
  
  // Recommendations
  console.log(`${colors.bold}${colors.green}💡 RECOMMENDATIONS${colors.reset}`);
  
  if (cycles.length > 0) {
    console.log(`  ${colors.red}🔄 Resolve circular dependencies by:`);
    console.log(`    • Moving shared code to a common package`);
    console.log(`    • Using dependency injection`);
    console.log(`    • Refactoring to break the cycles${colors.reset}`);
  }
  
  if (mismatches.length > 0) {
    console.log(`  ${colors.yellow}⚠️  Fix version mismatches by:`);
    console.log(`    • Standardizing versions in root package.json`);
    console.log(`    • Using exact versions for workspace dependencies`);
    console.log(`    • Running 'pnpm update' to align versions${colors.reset}`);
  }
  
  const highlyDepended = mostDepended.filter(([, data]) => data.dependedBy.length > 3);
  if (highlyDepended.length > 0) {
    console.log(`  ${colors.blue}🎯 Consider splitting highly depended packages:`);
    highlyDepended.forEach(([name]) => {
      console.log(`    • ${name} has many dependents - consider breaking into smaller packages`);
    });
    console.log(`${colors.reset}`);
  }
  
  console.log(`${colors.green}  ✅ Consider creating shared types package for better organization`);
  console.log(`  ✅ Use workspace protocols (workspace:*) for internal dependencies`);
  console.log(`  ✅ Implement proper build caching in turbo.json${colors.reset}`);
}

// Main execution
const rootDir = process.cwd();
const packageFiles = findPackageJsonFiles(rootDir);
const packages = packageFiles.map(analyzePackage).filter(Boolean);

generateReport(packages);