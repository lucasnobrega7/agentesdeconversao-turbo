"use client"

import { Bell, Search, Settings, User } from "lucide-react"
import { useState } from "react"

interface DashboardHeaderProps {
  userName?: string
  userEmail?: string
  organizationName?: string
}

export function DashboardHeader({ 
  userName = "Usuário",
  userEmail = "usuario@exemplo.com",
  organizationName = "Minha Organização"
}: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Search Section */}
        <div className="flex flex-1 items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar agentes, conversas, templates..."
              className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-2">
          {/* Organization Switcher */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground">
            <span className="font-medium">{organizationName}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-accent rounded-md transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover p-4 shadow-lg">
                <h3 className="font-semibold mb-2">Notificações</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 hover:bg-accent rounded cursor-pointer">
                    <p className="font-medium">Nova conversa iniciada</p>
                    <p className="text-muted-foreground text-xs">Há 5 minutos</p>
                  </div>
                  <div className="p-2 hover:bg-accent rounded cursor-pointer">
                    <p className="font-medium">Agente atualizado com sucesso</p>
                    <p className="text-muted-foreground text-xs">Há 1 hora</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="p-2 hover:bg-accent rounded-md transition-colors">
            <Settings className="h-5 w-5" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover shadow-lg">
                <div className="p-2">
                  <a href="/billing" className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Billing & Planos
                  </a>
                  <a href="/integrations" className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Integrações
                  </a>
                  <hr className="my-2" />
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer text-destructive">
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
