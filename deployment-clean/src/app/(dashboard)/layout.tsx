import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { dashboardNavigation, isActiveRoute } from '@/config/navigation'
import { Zap, Bell, Search, User } from 'lucide-react'

import { NavigationSidebar } from '@/components/navigation-sidebar'

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
          <div className="mr-4 flex">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold">Agentes de Conversão</span>
            </Link>
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
              
              <button className="relative p-2 text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium hidden md:block">Lucas Nóbrega</span>
              </div>
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