export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-muted-foreground">
            Acesse sua conta dos Agentes de Conversão
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground">
            Página de login em desenvolvimento
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Integração com Supabase Auth será implementada na Fase 2
          </p>
        </div>
      </div>
    </div>
  )
}