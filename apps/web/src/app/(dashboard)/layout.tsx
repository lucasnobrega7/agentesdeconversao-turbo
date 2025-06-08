'use client'

import React from 'react'
import Link from 'next/link'
import { Zap, Search } from 'lucide-react'

import { NavigationSidebar } from '@/components/navigation-sidebar'
import { ModeToggle } from '@/components/mode-toggle'
// Componentes temporariamente removidos até serem criados
// import { UserNav } from '@/components/dashboard/user-nav'
// import { OrganizationSwitcher } from '@/components/dashboard/organization-switcher'
// import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar Enterprise */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold">Agentes de Conversão</span>
            </Link>
            {/* <OrganizationSwitcher /> */}
          </div>
          
          <div className="flex flex-1 items-center justify-between">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Buscar agentes, conversas..."
                  className="pl-8 pr-4 py-2 w-64 text-sm border rounded-md bg-background"
                />
              </div>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden lg:block">
                dash.agentesdeconversao.ai
              </span>
              
              {/* <NotificationsDropdown /> */}
              <ModeToggle />
              {/* <UserNav /> */}
              <div className="text-sm">Dashboard</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Enterprise Navigation */}
        <NavigationSidebar />

        {/* Main Content */}
        <main className="ml-64 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}