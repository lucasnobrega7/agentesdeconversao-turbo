'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { dashboardNavigation, isActiveRoute } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function NavigationSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background/95 backdrop-blur">
      <nav className="space-y-2 p-4">
        {dashboardNavigation.map((section) => (
          <div key={section.title} className="pb-2">
            <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = isActiveRoute(item.href, pathname)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        "ml-auto inline-flex items-center rounded-full px-2 py-1 text-xs",
                        typeof item.badge === 'number' 
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}