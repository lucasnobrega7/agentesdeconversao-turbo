"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const notifications = [
  {
    id: 1,
    title: "Novo agente criado",
    description: "Seu agente 'Assistente de Vendas' foi criado com sucesso.",
    time: "Há 5 minutos",
    read: false,
  },
  {
    id: 2,
    title: "Conversa transferida",
    description: "Uma conversa foi transferida para você por João Silva.",
    time: "Há 1 hora",
    read: true,
  },
  {
    id: 3,
    title: "Documento processado",
    description: "Seu documento 'Manual de Produtos' foi processado com sucesso.",
    time: "Há 3 horas",
    read: true,
  },
]

export function NotificationsDropdown() {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          <DropdownMenuGroup>
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="cursor-pointer">
                <div className="flex flex-col space-y-1 py-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${!notification.read ? "text-primary" : ""}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.description}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center">
          <span className="text-sm text-primary">Ver todas as notificações</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
