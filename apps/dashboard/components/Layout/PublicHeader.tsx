"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface PublicHeaderProps {
  transparent?: boolean
}

export function PublicHeader({ transparent = false }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const headerClass = transparent
    ? "fixed top-0 w-full z-50 bg-transparent backdrop-blur-md"
    : "sticky top-0 w-full z-50 bg-background border-b"

  return (
    <header className={headerClass}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl">Agentes de Conversão</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link 
                href="/features" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Recursos
              </Link>
              <Link 
                href="/pricing" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Preços
              </Link>
              <Link 
                href="/templates" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Templates
              </Link>
              <Link 
                href="/docs" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Documentação
              </Link>
              <Link 
                href="/blog" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/auth/login" 
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Começar Grátis
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-foreground hover:bg-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/features" 
                className="block px-3 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md"
              >
                Recursos
              </Link>
              <Link 
                href="/pricing" 
                className="block px-3 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md"
              >
                Preços
              </Link>
              <Link 
                href="/templates" 
                className="block px-3 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md"
              >
                Templates
              </Link>
              <Link 
                href="/docs" 
                className="block px-3 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md"
              >
                Documentação
              </Link>
              <Link 
                href="/blog" 
                className="block px-3 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md"
              >
                Blog
              </Link>
              <hr className="my-2 border-border" />
              <Link 
                href="/auth/login" 
                className="block px-3 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md"
              >
                Entrar
              </Link>
              <Link 
                href="/auth/signup" 
                className="block px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-center"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
