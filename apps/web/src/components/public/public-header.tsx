'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <span className="hidden font-bold sm:inline-block">
              Agentes de Conversão
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/sobre" className="transition-colors hover:text-foreground/80 text-foreground/60">Sobre</Link>
            <Link href="/precos" className="transition-colors hover:text-foreground/80 text-foreground/60">Preços</Link>
            <Link href="/recursos" className="transition-colors hover:text-foreground/80 text-foreground/60">Recursos</Link>
            <Link href="/contato" className="transition-colors hover:text-foreground/80 text-foreground/60">Contato</Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}