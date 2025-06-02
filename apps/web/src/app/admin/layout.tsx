import React from 'react'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  Bot,
  MessageSquare,
  BarChart3,
  Key,
  Settings,
  Database,
  Activity,
  Globe,
  Wrench
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/admin" className="mr-6 flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold">Admin Panel</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <span className="text-sm text-muted-foreground">admin.agentesdeconversao.ai</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background/95 backdrop-blur">
          <nav className="space-y-2 p-4">
            {/* System Management */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                SYSTEM
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </Link>
                <Link 
                  href="/admin/api-status" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Activity className="h-4 w-4" />
                  API Status
                </Link>
                <Link 
                  href="/admin/config-check" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                  Config Check
                </Link>
                <Link 
                  href="/admin/logs" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Database className="h-4 w-4" />
                  System Logs
                </Link>
              </div>
            </div>

            {/* User Management */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                USERS & ORGS
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/admin/users" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>
                <Link 
                  href="/admin/organizations" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Globe className="h-4 w-4" />
                  Organizations
                </Link>
              </div>
            </div>

            {/* Content Management */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                CONTENT
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/admin/agents" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Bot className="h-4 w-4" />
                  All Agents
                </Link>
                <Link 
                  href="/admin/conversations" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <MessageSquare className="h-4 w-4" />
                  All Conversations
                </Link>
              </div>
            </div>

            {/* Security & Access */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                SECURITY
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/admin/api-keys" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Key className="h-4 w-4" />
                  API Keys
                </Link>
                <Link 
                  href="/admin/metrics" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <BarChart3 className="h-4 w-4" />
                  Metrics
                </Link>
                <Link 
                  href="/admin/billing" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Database className="h-4 w-4" />
                  Billing
                </Link>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="pb-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                INFRASTRUCTURE
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/admin/subdomains" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Globe className="h-4 w-4" />
                  Subdomains
                </Link>
                <Link 
                  href="/admin/maintenance" 
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Wrench className="h-4 w-4" />
                  Maintenance
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Admin Main Content */}
        <main className="ml-64 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}