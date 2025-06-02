import Link from "next/link"

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Agentes de Conversão</span>
        </Link>
      </div>
    </header>
  )
}
