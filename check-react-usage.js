// check-react-usage.js
const fs = require('fs');
const path = require('path');

function checkProjectStructure() {
  const results = {
    hasAppRouter: false,
    hasPagesRouter: false,
    serverComponents: 0,
    clientComponents: 0,
    dependencies: []
  };

  // Verifica estrutura de diretórios
  if (fs.existsSync('./app') || fs.existsSync('./src/app')) {
    results.hasAppRouter = true;
    console.log('✓ App Router detectado');
  }
  
  if (fs.existsSync('./pages') || fs.existsSync('./src/pages')) {
    results.hasPagesRouter = true;
    console.log('✓ Pages Router detectado');
  }

  // Analisa package.json
  try {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    console.log('\nDependências principais:');
    console.log(`- Next.js: ${pkg.dependencies.next}`);
    console.log(`- React: ${pkg.dependencies.react}`);
    console.log(`- TypeScript: ${pkg.devDependencies?.typescript || 'não encontrado'}`);
    
    // Verifica dependências que podem ter problemas com React 19
    const criticalDeps = [
      'react-hook-form',
      'react-query',
      '@tanstack/react-query',
      'styled-components',
      '@emotion/react',
      'framer-motion'
    ];
    
    console.log('\nDependências críticas:');
    criticalDeps.forEach(dep => {
      if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
        const version = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
        console.log(`- ${dep}: ${version}`);
        results.dependencies.push({name: dep, version});
      }
    });
  } catch (e) {
    console.error('Erro ao ler package.json:', e.message);
  }

  // Recomendação
  console.log('\n📋 Recomendação:');
  if (results.hasAppRouter && !results.hasPagesRouter) {
    console.log('➜ Você usa apenas App Router - RECOMENDO atualizar para React 19');
  } else if (!results.hasAppRouter && results.hasPagesRouter) {
    console.log('➜ Você usa apenas Pages Router - pode manter React 18 por enquanto');
  } else if (results.hasAppRouter && results.hasPagesRouter) {
    console.log('➜ Você usa ambos os routers - avalie a migração com cuidado');
  }
  
  if (results.dependencies.length > 0) {
    console.log('\n⚠️  Verifique a compatibilidade das dependências listadas com React 19');
  }
}

checkProjectStructure();