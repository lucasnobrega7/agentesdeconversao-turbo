// check-react19-compatibility.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Análise de Compatibilidade com React 19\n');
console.log('='.repeat(50));

// 1. Verifica estrutura do projeto
console.log('\n📁 Estrutura do Projeto:');
const appDirs = ['./app', './src/app', '../web/src/app', 'apps/web/src/app'];
const pagesDirs = ['./pages', './src/pages', '../web/src/pages', 'apps/web/src/pages'];

let hasAppRouter = false;
let hasPages = false;
let appPath = '';

appDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    hasAppRouter = true;
    appPath = dir;
    console.log(`✅ App Router encontrado em: ${dir}`);
  }
});

pagesDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    hasPages = true;
    console.log(`⚠️  Pages Router encontrado em: ${dir}`);
  }
});

// 2. Analisa componentes
console.log('\n🧩 Análise de Componentes:');
let clientComponents = 0;
let serverComponents = 0;
let useClientFiles = [];
let potentialIssues = [];

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verifica 'use client'
    if (content.includes("'use client'") || content.includes('"use client"')) {
      clientComponents++;
      useClientFiles.push(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      serverComponents++;
    }
    
    // Verifica padrões problemáticos
    if (content.includes('useLayoutEffect') && !content.includes("'use client'")) {
      potentialIssues.push({
        file: filePath,
        issue: 'useLayoutEffect sem "use client"'
      });
    }
    
    if (content.includes('window.') && !content.includes("'use client'") && !content.includes('typeof window')) {
      potentialIssues.push({
        file: filePath,
        issue: 'Acesso a window sem verificação'
      });
    }
  } catch (e) {
    // Ignora erros de leitura
  }
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
        walkDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        analyzeFile(filePath);
      }
    });
  } catch (e) {
    // Ignora erros
  }
}

if (hasAppRouter && appPath) {
  walkDir(appPath);
  console.log(`- Server Components: ${serverComponents}`);
  console.log(`- Client Components: ${clientComponents}`);
  console.log(`- Taxa de Server Components: ${Math.round((serverComponents / (serverComponents + clientComponents)) * 100)}%`);
}

// 3. Verifica dependências
console.log('\n📦 Dependências Críticas:');
try {
  const pkgPath = fs.existsSync('./package.json') ? './package.json' : '../../package.json';
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  const compatibility = {
    '✅ Compatível': [],
    '⚠️  Verificar': [],
    '❌ Incompatível': []
  };
  
  // Lista de compatibilidade conhecida
  const depStatus = {
    '@tanstack/react-query': { status: '✅ Compatível', note: 'v5+ compatível' },
    'react-hook-form': { status: '✅ Compatível', note: 'v7.48+ compatível' },
    'framer-motion': { status: '⚠️  Verificar', note: 'Testar animações' },
    'styled-components': { status: '⚠️  Verificar', note: 'v6+ recomendado' },
    '@emotion/react': { status: '⚠️  Verificar', note: 'Pode precisar atualização' },
    'react-redux': { status: '✅ Compatível', note: 'v9+ compatível' },
    'zustand': { status: '✅ Compatível', note: 'v4.5+ compatível' },
    'swr': { status: '✅ Compatível', note: 'v2.2+ compatível' },
    'react-router-dom': { status: '❌ Incompatível', note: 'Use Next.js routing' }
  };
  
  Object.keys(deps).forEach(dep => {
    if (depStatus[dep]) {
      const info = depStatus[dep];
      compatibility[info.status].push(`${dep}@${deps[dep]} - ${info.note}`);
    }
  });
  
  Object.entries(compatibility).forEach(([status, list]) => {
    if (list.length > 0) {
      console.log(`\n${status}:`);
      list.forEach(item => console.log(`  ${item}`));
    }
  });
} catch (e) {
  console.error('Erro ao analisar dependências:', e.message);
}

// 4. Problemas potenciais
if (potentialIssues.length > 0) {
  console.log('\n⚠️  Problemas Potenciais Encontrados:');
  potentialIssues.slice(0, 5).forEach(issue => {
    console.log(`- ${issue.file}: ${issue.issue}`);
  });
  if (potentialIssues.length > 5) {
    console.log(`... e mais ${potentialIssues.length - 5} problemas`);
  }
}

// 5. Recomendações finais
console.log('\n📋 Recomendações para Migração:');
console.log('='.repeat(50));

if (hasAppRouter && !hasPages) {
  console.log('✅ Projeto usa apenas App Router - IDEAL para React 19!');
  console.log('\n1. Atualize as dependências:');
  console.log('   pnpm add react@rc react-dom@rc');
  console.log('   pnpm add -D @types/react@rc @types/react-dom@rc');
  
  console.log('\n2. Teste funcionalidades críticas:');
  console.log('   - Server Components');
  console.log('   - Client Components com hooks');
  console.log('   - Formulários (react-hook-form)');
  console.log('   - Queries (tanstack-query)');
  console.log('   - Animações (framer-motion)');
  
  console.log('\n3. Benefícios do React 19:');
  console.log('   - Actions (substituem API routes para mutations)');
  console.log('   - useFormStatus/useFormState nativos');
  console.log('   - Melhor performance SSR');
  console.log('   - Menor bundle size');
}

if (hasPages) {
  console.log('⚠️  Projeto usa Pages Router - migração mais complexa');
  console.log('Considere migrar para App Router primeiro');
}

console.log('\n🚀 Comando para testar React 19:');
console.log('pnpm add react@rc react-dom@rc && pnpm add -D @types/react@rc @types/react-dom@rc');

console.log('\n📚 Documentação:');
console.log('https://react.dev/blog/2024/12/05/react-19');
console.log('https://nextjs.org/docs/app/building-your-application/upgrading/react-19');