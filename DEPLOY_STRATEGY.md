# ESTRATÉGIA DEFINITIVA DE DEPLOY - MONOREPO VERCEL
# Última atualização: 31/05/2025 00:45

## 🔍 ROOT CAUSE ANALYSIS

### Problemas Identificados:
1. **Configuração de Root Directory incorreta** - Tentando navegar via comandos ao invés de configurar no Vercel
2. **Referências workspace:* contaminando o ambiente** - npm detecta workspace mesmo com .vercelignore
3. **Múltiplos projetos Vercel conflitantes** - 19 projetos criando confusão de identidade
4. **Node.js version mismatch** - Projeto configurado para Node 22.x, código requer 20.x

### Solução Arquitetural:

#### OPÇÃO A: Deploy Direto do Root (Recomendado para CI/CD)
- Manter vercel.json no root
- Configurar buildCommand para navegar explicitamente
- Usar .vercelignore estratégico

#### OPÇÃO B: Root Directory no Vercel (Recomendado para simplicidade)
- Configurar Root Directory: apps/web no dashboard
- vercel.json simples dentro de apps/web
- Comandos relativos ao diretório

## 📋 IMPLEMENTAÇÃO

### 1. Limpeza de Metadados Conflitantes
```bash
rm -rf .vercel apps/web/.vercel
rm -f package-lock.json pnpm-lock.yaml
```

### 2. Configuração do vercel.json (Root)
```json
{
  "buildCommand": "cd apps/web && npm ci --force --legacy-peer-deps && npm run build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "echo 'Skipping root install'",
  "framework": "nextjs",
  "regions": ["gru1"]
}
```

### 3. .vercelignore Estratégico
```
# Bloquear apenas o problemático
pnpm-workspace.yaml
packages/
apps/dashboard/
```

### 4. Deploy via CLI
```bash
vercel --prod --yes
```

## 🚀 PRÓXIMOS PASSOS

1. Configurar webhook GitHub corretamente
2. Separar projetos no Vercel (1 por app)
3. Implementar nx-ignore para builds otimizados
