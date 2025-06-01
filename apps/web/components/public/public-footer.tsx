import Link from "next/link"

export function PublicFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Agentes de Conversão</h3>
            <p className="text-sm text-muted-foreground">
              Transforme suas conversas em conversões com agentes de IA inteligentes.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recursos" className="text-muted-foreground hover:text-foreground">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="/precos" className="text-muted-foreground hover:text-foreground">
                  Preços
                </Link>
              </li>
              <li>
                <Link href="/casos-de-uso" className="text-muted-foreground hover:text-foreground">
                  Casos de Uso
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="text-muted-foreground hover:text-foreground">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-muted-foreground hover:text-foreground">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidade" className="text-muted-foreground hover:text-foreground">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-muted-foreground hover:text-foreground">
                  Termos
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://docs.agentesdeconversao.ai" className="text-muted-foreground hover:text-foreground">
                  Documentação
                </Link>
              </li>
              <li>
                <Link href="/suporte" className="text-muted-foreground hover:text-foreground">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-muted-foreground hover:text-foreground">
                  Status
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Agentes de Conversão. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
