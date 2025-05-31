// 🧭 NAVEGAÇÃO ENTERPRISE - Configuração Central
// Arquitetura conforme CLAUDE.md especificação

import {
  BarChart3,
  Bot,
  MessageSquare,
  TrendingUp,
  Monitor,
  FileText,
  Shield,
  Zap,
  Settings,
  Users,
  Building,
  Key,
  CreditCard,
  Bell,
  Target,
  GitBranch,
  Globe,
  BookOpen,
  HeadphonesIcon
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: any
  badge?: string | number
  current?: boolean
  children?: NavigationItem[]
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

// 📊 NAVEGAÇÃO PRINCIPAL DO DASHBOARD
export const dashboardNavigation: NavigationSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
      },
      {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: TrendingUp,
      },
      {
        name: 'Monitoramento',
        href: '/dashboard/monitoring',
        icon: Monitor,
        badge: 'Live'
      },
    ],
  },
  {
    title: 'AGENTES IA',
    items: [
      {
        name: 'Meus Agentes',
        href: '/dashboard/agents',
        icon: Bot,
      },
      {
        name: 'AgentStudio',
        href: '/dashboard/agent-studio',
        icon: Zap,
      },
    ],
  },
  {
    title: 'CONVERSAS',
    items: [
      {
        name: 'Todas as Conversas',
        href: '/dashboard/conversations',
        icon: MessageSquare,
      },
      {
        name: 'Ativas',
        href: '/dashboard/conversations/active',
        icon: Target,
        badge: 24
      },
      {
        name: 'Arquivadas',
        href: '/dashboard/conversations/archived',
        icon: FileText,
      },
    ],
  },
  {
    title: 'CONHECIMENTO',
    items: [
      {
        name: 'Documentos',
        href: '/dashboard/knowledge',
        icon: FileText,
      },
      {
        name: 'Conectores MCP',
        href: '/dashboard/knowledge/mcp',
        icon: Shield,
      },
      {
        name: 'Upload',
        href: '/dashboard/knowledge/upload',
        icon: FileText,
      },
    ],
  },
  {
    title: 'INTEGRAÇÕES',
    items: [
      {
        name: 'WhatsApp & Telegram',
        href: '/dashboard/integrations',
        icon: Zap,
      },
      {
        name: 'Web Chat',
        href: '/dashboard/integrations/webchat',
        icon: Globe,
      },
      {
        name: 'Webhooks',
        href: '/dashboard/integrations/webhooks',
        icon: GitBranch,
      },
    ],
  },
  {
    title: 'ORGANIZAÇÃO',
    items: [
      {
        name: 'Equipe',
        href: '/dashboard/team',
        icon: Users,
      },
      {
        name: 'Configurações',
        href: '/dashboard/settings',
        icon: Settings,
      },
      {
        name: 'Faturamento',
        href: '/dashboard/billing',
        icon: CreditCard,
      },
      {
        name: 'API Keys',
        href: '/dashboard/api-keys',
        icon: Key,
      },
    ],
  },
]

// 🔧 NAVEGAÇÃO ADMINISTRATIVA
export const adminNavigation: NavigationSection[] = [
  {
    title: 'ADMINISTRAÇÃO',
    items: [
      {
        name: 'Overview',
        href: '/admin',
        icon: BarChart3,
      },
      {
        name: 'Usuários',
        href: '/admin/users',
        icon: Users,
      },
      {
        name: 'Organizações',
        href: '/admin/organizations',
        icon: Building,
      },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      {
        name: 'Status da API',
        href: '/admin/api-status',
        icon: Monitor,
      },
      {
        name: 'Logs',
        href: '/admin/logs',
        icon: FileText,
      },
      {
        name: 'Métricas',
        href: '/admin/metrics',
        icon: TrendingUp,
      },
    ],
  },
  {
    title: 'CONFIGURAÇÃO',
    items: [
      {
        name: 'Subdomínios',
        href: '/admin/subdomains',
        icon: Globe,
      },
      {
        name: 'Manutenção',
        href: '/admin/maintenance',
        icon: Settings,
      },
    ],
  },
]

// 🌐 NAVEGAÇÃO PÚBLICA
export const publicNavigation: NavigationItem[] = [
  {
    name: 'Recursos',
    href: '/recursos',
    icon: Zap,
  },
  {
    name: 'Preços',
    href: '/precos',
    icon: CreditCard,
  },
  {
    name: 'Casos de Uso',
    href: '/casos-de-uso',
    icon: Target,
  },
  {
    name: 'Blog',
    href: '/blog',
    icon: BookOpen,
  },
  {
    name: 'Contato',
    href: '/contato',
    icon: HeadphonesIcon,
  },
]

// 📚 NAVEGAÇÃO DE DOCUMENTAÇÃO
export const docsNavigation: NavigationSection[] = [
  {
    title: 'INÍCIO',
    items: [
      {
        name: 'Introdução',
        href: '/docs',
        icon: BookOpen,
      },
      {
        name: 'Quickstart',
        href: '/docs/quickstart',
        icon: Zap,
      },
    ],
  },
  {
    title: 'GUIAS',
    items: [
      {
        name: 'Criando Agentes',
        href: '/docs/guides/creating-agents',
        icon: Bot,
      },
      {
        name: 'Integrações',
        href: '/docs/guides/integrations',
        icon: GitBranch,
      },
    ],
  },
  {
    title: 'API',
    items: [
      {
        name: 'Referência',
        href: '/docs/api-reference',
        icon: FileText,
      },
      {
        name: 'SDKs',
        href: '/docs/sdks',
        icon: Settings,
      },
    ],
  },
]

// 🎯 BREADCRUMBS MAPPING
export const breadcrumbsConfig: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/dashboard/agents': ['Dashboard', 'Agentes'],
  '/dashboard/agents/new': ['Dashboard', 'Agentes', 'Novo Agente'],
  '/dashboard/analytics': ['Dashboard', 'Analytics'],
  '/dashboard/conversations': ['Dashboard', 'Conversas'],
  '/dashboard/settings': ['Dashboard', 'Configurações'],
  '/dashboard/team': ['Dashboard', 'Equipe'],
  '/admin': ['Admin'],
  '/admin/users': ['Admin', 'Usuários'],
  '/admin/organizations': ['Admin', 'Organizações'],
}

// 🚀 HELPER FUNCTIONS
export function getActiveNavItem(pathname: string, navigation: NavigationSection[]): NavigationItem | null {
  for (const section of navigation) {
    for (const item of section.items) {
      if (item.href === pathname) {
        return { ...item, current: true }
      }
      if (item.children) {
        const activeChild = item.children.find(child => child.href === pathname)
        if (activeChild) {
          return { ...activeChild, current: true }
        }
      }
    }
  }
  return null
}

export function getBreadcrumbs(pathname: string): string[] {
  return breadcrumbsConfig[pathname] || []
}

export function isActiveRoute(href: string, pathname: string): boolean {
  if (href === '/dashboard' && pathname === '/dashboard') return true
  if (href !== '/dashboard' && pathname.startsWith(href)) return true
  return false
}