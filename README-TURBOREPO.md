# Agentes de Conversão - Turborepo

Este é o monorepo oficial do projeto Agentes de Conversão, utilizando [Turborepo](https://turbo.build/).

## 🏗️ Estrutura

```
.
├── apps/
│   ├── web/              # Aplicação Next.js principal
│   ├── api/              # Backend FastAPI
│   ├── dashboard/        # Dashboard Admin (futuro)
│   └── docs/             # Documentação (futuro)
├── packages/
│   ├── ui/               # Componentes React compartilhados
│   ├── eslint-config/    # Configurações ESLint compartilhadas
│   └── typescript-config/# Configurações TypeScript compartilhadas
└── turbo.json           # Configuração do Turborepo
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js >= 18
- pnpm >= 9.0.0

### Instalação

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Build
pnpm build
```

## 📦 Aplicações & Pacotes

### Apps

- `web`: Aplicação Next.js principal com App Router
- `api`: Backend FastAPI com Python
- `dashboard`: Dashboard administrativo (planejado)
- `docs`: Documentação com Mintlify (planejado)

### Packages

- `@repo/ui`: Biblioteca de componentes React compartilhada
- `@repo/eslint-config`: Configurações ESLint reutilizáveis
- `@repo/typescript-config`: Configurações TypeScript base

## 🛠️ Comandos Úteis

```bash
# Executar em modo desenvolvimento
pnpm dev

# Build de todas as aplicações
pnpm build

# Executar linting
pnpm lint

# Verificar tipos TypeScript
pnpm check-types

# Formatar código
pnpm format

# Limpar cache e builds
pnpm clean
```

## 🔧 Ferramentas

- [Turborepo](https://turbo.build/) - Monorepo build system
- [pnpm](https://pnpm.io/) - Gerenciador de pacotes eficiente
- [Next.js 15](https://nextjs.org/) - Framework React
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [ESLint](https://eslint.org/) - Linting
- [Prettier](https://prettier.io/) - Formatação de código

## 🚀 Deploy

### Vercel

O projeto está configurado para deploy automático no Vercel:

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente necessárias
3. O Vercel detectará automaticamente o Turborepo

### Configuração do Vercel

```json
{
  "buildCommand": "turbo run build",
  "outputDirectory": "apps/web/.next"
}
```

## 📄 Licença

Propriedade de Agentes de Conversão. Todos os direitos reservados.