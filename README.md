# Agentes de Conversão - Monorepo

Plataforma enterprise de IA conversacional para automatizar vendas, atendimento ao cliente e conversões.

## 🏗️ Estrutura do Monorepo

```
packages/
├── ui/                      # Compiled - Design System (shadcn/ui)
├── ui-chat/                 # Compiled - Widget embeddable otimizado
├── agent-studio/            # Compiled - Editor visual (React Flow)
├── analytics-components/    # Compiled - Componentes de visualização
├── types/                   # JIT - TypeScript types compartilhados
├── utils/                   # JIT - Funções utilitárias
├── config/                  # JIT - Configurações compartilhadas
└── design-tokens/           # JIT - Tokens de design

apps/
├── web/                     # App principal (Next.js 15.3.3)
├── lp/                      # Landing page (em breve)
├── docs/                    # Documentação (em breve)
└── api/                     # Backend FastAPI (em breve)
```

## 📦 Estratégia de Pacotes

### Compiled Packages
- **@repo/ui** - Sistema de design compartilhado
- **@repo/ui-chat** - Widget de chat otimizado para embed
- **@repo/agent-studio** - Editor visual de fluxos
- **@repo/analytics-components** - Dashboards e gráficos

### Just-in-Time Packages
- **@repo/types** - TypeScript types
- **@repo/utils** - Funções utilitárias
- **@repo/design-tokens** - Cores, espaçamentos, etc
- **@repo/config** - ESLint, TypeScript configs

## 🚀 Quick Start

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Type check
pnpm check-types
```

## 🛠️ Stack

- **React 19** + **Next.js 15.3.3**
- **TypeScript 5.8.3**
- **Turbopack** para builds rápidos
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** para backend
- **React Flow** para editor visual

## 📊 Benefícios da Arquitetura

1. **Performance**: Compiled packages são otimizados e cacheados
2. **DX**: JIT packages permitem desenvolvimento rápido
3. **Escalabilidade**: Cada subdomínio pode ter seu próprio app
4. **Manutenibilidade**: Boundaries claros entre domínios
5. **Type Safety**: TypeScript em todo lugar

## 🎯 Próximos Passos

1. Implementar apps para cada subdomínio
2. Configurar CI/CD com Turbo Remote Caching
3. Adicionar testes E2E com Playwright
4. Documentação com Nextra
