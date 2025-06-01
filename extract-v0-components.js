const fs = require('fs');
const path = require('path');

// Ler o arquivo JSON do v0.dev
const data = JSON.parse(fs.readFileSync('v0-components-new.json', 'utf8'));

// Criar diretórios necessários
const dirs = new Set();
data.files.forEach(file => {
  const dir = path.dirname(file.path);
  dirs.add(dir);
});

// Criar todos os diretórios
dirs.forEach(dir => {
  const fullPath = path.join('apps/web', dir);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`Created directory: ${fullPath}`);
});

// Extrair e salvar cada arquivo
data.files.forEach(file => {
  // Pular layouts principais para não sobrescrever
  if (file.path.includes('layout.tsx') && !file.path.includes('agent-studio')) {
    console.log(`Skipping: ${file.path} (layout file)`);
    return;
  }
  
  const fullPath = path.join('apps/web', file.path);
  
  // Se o arquivo já existe e não é do agent-studio, criar versão .v0
  if (fs.existsSync(fullPath) && !file.path.includes('agent-studio')) {
    const v0Path = fullPath.replace('.tsx', '.v0.tsx').replace('.ts', '.v0.ts').replace('.css', '.v0.css');
    fs.writeFileSync(v0Path, file.content);
    console.log(`Created v0 version: ${v0Path}`);
  } else {
    // Criar arquivo novo
    fs.writeFileSync(fullPath, file.content);
    console.log(`Created: ${fullPath}`);
  }
});

console.log('\nExtraction complete!');