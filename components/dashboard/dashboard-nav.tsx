import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Bot,
  Brain,
  FileText,
  FlowerIcon as FlowIcon,
  Home,
  MessageSquare,
  Settings,
  Users,
  Zap,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  submenu?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="mr-2 h-4 w-4" />,
  },
  {
    title: "Agentes",
    href: "/agents",
    icon: <Bot className="mr-2 h-4 w-4" />,
    submenu: [
      { title: "Todos os Agentes", href: "/agents" },
      { title: "Criar Agente", href: "/agents/new" },
    ],
  },
  {
    title: "AgentStudio",
    href: "/agent-studio",
    icon: <FlowIcon className="mr-2 h-4 w-4" />,
    submenu: [
      { title: "Meus Fluxos", href: "/agent-studio" },
      { title: "Templates", href: "/agent-studio/templates" },
    ],
  },
  {
    title: "Conversas",
    href: "/conversations",
    icon: <MessageSquare className="mr-2 h-4 w-4" />,
    submenu: [
      { title: "Todas as Conversas", href: "/conversations" },
      { title: "Conversas Ativas", href: "/conversations/active" },
      { title: "Arquivadas", href: "/conversations/archived" },
    ],
  },
  {
    title: "Conhecimento",
    href: "/knowledge",
    icon: <Brain className="mr-2 h-4 w-4" />,
    submenu: [
      { title: "Documentos", href: "/knowledge/documents" },
      { title: "Upload", href: "/knowledge/upload" },
      { title: "Conectores", href: "/knowledge/mcp" },
    ],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
    submenu: [
      { title: "Visão Geral", href: "/analytics" },
      { title: "Conversas", href: "/analytics/conversations" },
      { title: "Conversões", href: "/analytics/conversion" },
    ],
  },
  {
    title: "Integrações",
    href: "/integrations",
    icon: <Zap className="mr-2 h-4 w-4" />,
  },
  {
    title: "Time",
    href: "/team",
    icon: <Users className="mr-2 h-4 w-4" />,
  },
  {
    title: "Documentação",
    href: "https://docs.agentesdeconversao.ai",
    icon: <FileText className="mr-2 h-4 w-4" />,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
]

export function DashboardNav() {
  return (
    <nav className="grid items-start gap-2 px-2 py-4 text-sm">
      {navItems.map((item, index) => (
        <div key={index} className="pb-1">
          <Link
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
          {item.submenu && (
            <div className="ml-6 mt-1 space-y-1">
              {item.submenu.map((subitem, subindex) => (
                <Link
                  key={subindex}
                  href={subitem.href}
                  className="block rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {subitem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
