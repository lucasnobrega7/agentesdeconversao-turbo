// test-react19-client-components.js
const fs = require('fs');
const path = require('path');

console.log('🧪 Verificando Client Components no React 19\n');

// Encontrar todos os Client Components
const clientComponents = [];
const srcPath = path.join(__dirname, 'apps/web/src');

function findClientComponents(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        findClientComponents(filePath);
      } else if ((file.endsWith('.tsx') || file.endsWith('.jsx')) && stat.isFile()) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes("'use client'") || content.includes('"use client"')) {
            clientComponents.push({
              path: filePath.replace(__dirname + '/', ''),
              hooks: extractHooks(content)
            });
          }
        } catch (e) {
          // Ignora erros de leitura
        }
      }
    });
  } catch (e) {
    // Ignora erros
  }
}

function extractHooks(content) {
  const hooks = [];
  const hookPattern = /use[A-Z]\w+/g;
  const matches = content.match(hookPattern);
  if (matches) {
    hooks.push(...new Set(matches));
  }
  return hooks;
}

// Buscar Client Components
findClientComponents(srcPath);

console.log(`📊 Total de Client Components: ${clientComponents.length}\n`);

if (clientComponents.length > 0) {
  console.log('📍 Client Components encontrados:');
  clientComponents.forEach((comp, index) => {
    console.log(`\n${index + 1}. ${comp.path}`);
    if (comp.hooks.length > 0) {
      console.log(`   Hooks usados: ${comp.hooks.join(', ')}`);
    }
  });
  
  console.log('\n✅ Checklist de Testes para Client Components:');
  console.log('  [ ] Todos os hooks funcionando corretamente');
  console.log('  [ ] Estados locais preservados');
  console.log('  [ ] Event handlers respondendo');
  console.log('  [ ] Sem erros no console');
  console.log('  [ ] Animações funcionando (se houver)');
} else {
  console.log('❌ Nenhum Client Component encontrado!');
}

// Verificar versões
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log('\n📦 Versões instaladas:');
  console.log(`  React: ${pkg.dependencies.react}`);
  console.log(`  React DOM: ${pkg.dependencies['react-dom']}`);
  console.log(`  @types/react: ${pkg.devDependencies['@types/react']}`);
  console.log(`  @types/react-dom: ${pkg.devDependencies['@types/react-dom']}`);
} catch (e) {
  console.error('Erro ao ler package.json');
}