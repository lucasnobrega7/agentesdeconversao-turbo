import Link from "next/link"
import { UserNav } from "@/components/v0-dashboard/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { OrganizationSwitcher } from "@/components/dashboard/organization-switcher"
import { NotificationsDropdown } from "@/components/dashboard/notifications-dropdown"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl">AC</span>
          </Link>
          <OrganizationSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline-block">Buscar</span>
            <span className="hidden sm:inline-block text-muted-foreground">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </span>
          </Button>
          <NotificationsDropdown />
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
