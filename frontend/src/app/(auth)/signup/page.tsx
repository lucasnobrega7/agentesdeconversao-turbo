import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Criar Conta | Agentes de Conversão',
  description: 'Crie sua conta na plataforma de agentes IA'
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Criar Conta</h2>
          <p className="mt-2 text-muted-foreground">
            Comece a criar agentes IA em minutos
          </p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Nome Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Criar Conta
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <a href="/login" className="text-primary hover:underline">
              Fazer login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
