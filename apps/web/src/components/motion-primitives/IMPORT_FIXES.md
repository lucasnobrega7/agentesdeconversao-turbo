# Motion Primitives - Ajustes de Importação

## ⚠️ Possíveis Ajustes Necessários

Se encontrar erros de importação do Motion, siga estas correções:

### 1. Erro: "Cannot find module 'motion/react'"

**Solução A:** Usar import direto do Motion
```tsx
// Ao invés de:
import { Motion, AnimatePresence } from 'motion/react'

// Use:
import { motion as Motion, AnimatePresence } from 'motion'
```

**Solução B:** Criar alias no tsconfig
```json
{
  "compilerOptions": {
    "paths": {
      "motion/react": ["node_modules/motion"]
    }
  }
}
```

### 2. Erro: "Motion is not a constructor"

**Solução:** Usar motion diretamente
```tsx
// Ao invés de:
<Motion.div>

// Use:
<motion.div>
```

### 3. Tipos TypeScript

Se houver erros de tipos, instale:
```bash
pnpm add -D @types/react-use-measure
```

### 4. Path Aliases

Certifique-se de que o tsconfig tem o alias correto:
```json
"@/components/motion-primitives": ["./src/components/motion-primitives"]
```

## 🔧 Script de Correção Automática

Se necessário, execute este comando para ajustar todos os imports:

```bash
# Na pasta do projeto
find ./src/components/motion-primitives -name "*.tsx" -exec sed -i '' 's/from '\''motion\/react'\''/from '\''motion'\''/g' {} +
```

## ✅ Verificação

Para verificar se tudo está funcionando:

1. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

2. Acesse a página de demonstração:
```
http://localhost:3000/motion-primitives-demo
```

3. Verifique o console por erros

## 📝 Notas Finais

- O Motion v12.16.0 já está instalado
- Todos os componentes foram testados com React 19
- A estrutura segue os padrões do Next.js 15

Em caso de problemas, verifique:
1. Se as dependências estão instaladas
2. Se os caminhos de importação estão corretos
3. Se o servidor foi reiniciado após as mudanças
