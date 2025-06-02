import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Agentes de Conversão</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/recursos" className="transition-colors hover:text-foreground/80">
            Recursos
          </Link>
          <Link href="/precos" className="transition-colors hover:text-foreground/80">
            Preços
          </Link>
          <Link href="/casos-de-uso" className="transition-colors hover:text-foreground/80">
            Casos de Uso
          </Link>
          <Link href="/blog" className="transition-colors hover:text-foreground/80">
            Blog
          </Link>
          <Link href="/contato" className="transition-colors hover:text-foreground/80">
            Contato
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Link href="https://login.agentesdeconversao.ai">
            <Button variant="outline">Entrar</Button>
          </Link>
          <Link href="https://login.agentesdeconversao.ai/signup">
            <Button>Começar Grátis</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
