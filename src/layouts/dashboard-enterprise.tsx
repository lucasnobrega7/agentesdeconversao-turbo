'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// 📊 Dashboard Enterprise Layout - Convergência Materio + SaaS

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function DashboardEnterprise({
  children,
  sidebar,
  header,
  className
}: DashboardLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background font-sans antialiased",
      "grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]",
      className
    )}>
      {header && (
        <header className="col-span-2 border-b bg-background/95 backdrop-blur">
          {header}
        </header>
      )}
      
      {sidebar && (
        <aside className="hidden border-r bg-muted/40 md:block">
          {sidebar}
        </aside>
      )}
      
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {children}
      </main>
    </div>
  )
}

interface SidebarProps {
  navigation: NavigationItem[]
  user?: any
  className?: string
}

interface NavigationItem {
  name: string
  href: string
  current?: boolean
  badge?: string | number
}

export function Sidebar({ navigation, user, className }: SidebarProps) {
  return (
    <div className={cn("flex h-full w-64 flex-col", className)}>
      <div className="flex h-16 shrink-0 items-center px-4">
        <h1 className="text-xl font-bold">Agentes IA</h1>
      </div>
      
      <nav className="flex flex-1 flex-col px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={cn(
                  item.current
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                )}
              >
                {item.name}
                {item.badge && (
                  <span className="ml-auto inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      {user && (
        <div className="flex items-center gap-x-4 px-4 py-3 text-sm font-medium">
          <div className="h-8 w-8 rounded-full bg-primary" />
          <span>{user.name}</span>
        </div>
      )}
    </div>
  )
}
