# 🚀 GUIA RÁPIDO DE INTEGRAÇÃO - Componentes v0.dev

## 1. **Dark Mode Toggle** (Mais Fácil)

### Passo 1: Adicionar no Header Existente
```tsx
// src/app/(dashboard)/layout.tsx
import { ModeToggle } from '@/components/mode-toggle'

// Adicionar no header, próximo aos ícones:
<ModeToggle />
```

### Passo 2: Verificar Theme Provider
```tsx
// src/app/layout.tsx - Já está configurado! ✅
<ThemeProvider
  attribute="class"
  defaultTheme="light"
  enableSystem
  disableTransitionOnChange
>
```

## 2. **Organization Switcher**

### Passo 1: Adicionar Componente
```tsx
// src/app/(dashboard)/layout.tsx
import { OrganizationSwitcher } from '@/components/dashboard/organization-switcher'

// Adicionar após o logo:
<OrganizationSwitcher />
```

### Passo 2: Conectar com Dados Reais
```tsx
// components/dashboard/organization-switcher.tsx
// TODO: Substituir array mock por dados do Supabase
const organizations = await getOrganizations() // Implementar
```

## 3. **Notifications Dropdown**

### Passo 1: Adicionar no Header
```tsx
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown'

// Adicionar antes do user menu:
<NotificationsDropdown />
```

### Passo 2: Integrar com Real-time
```tsx
// TODO: Conectar com Supabase Realtime
// ou WebSocket para notificações ao vivo
```

## 4. **User Navigation Menu**

### Passo 1: Substituir Ícone Atual
```tsx
import { UserNav } from '@/components/dashboard/user-nav'

// Substituir o ícone User por:
<UserNav />
```

### Passo 2: Conectar com Auth
```tsx
// Adicionar dados do usuário logado
// Implementar logout funcional
```

## 📝 Exemplo de Integração Completa

```tsx
// src/app/(dashboard)/layout.tsx - Header atualizado
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
  <div className="container flex h-14 items-center">
    <div className="mr-4 flex items-center">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <Zap className="h-6 w-6 text-primary" />
        <span className="font-bold">Agentes de Conversão</span>
      </Link>
      <OrganizationSwitcher /> {/* NOVO */}
    </div>
    
    <div className="flex flex-1 items-center justify-between">
      {/* Search existente */}
      
      <div className="flex items-center space-x-4">
        <NotificationsDropdown /> {/* NOVO */}
        <ModeToggle /> {/* NOVO */}
        <UserNav /> {/* NOVO */}
      </div>
    </div>
  </div>
</header>
```

## ✅ Benefícios Imediatos

1. **Dark Mode** - Melhora UX instantaneamente
2. **Organization Switcher** - Multi-tenant visual
3. **Notifications** - Engagement aumentado
4. **User Menu** - Navegação profissional

## 🎯 Ordem de Implementação Sugerida

1. ✅ Dark Mode (5 min)
2. ✅ User Nav (10 min)
3. 🔧 Organization Switcher (30 min com dados)
4. 🔧 Notifications (1h com real-time)

---

**Dica**: Comece pelo Dark Mode - é rápido e impressiona! 🌙