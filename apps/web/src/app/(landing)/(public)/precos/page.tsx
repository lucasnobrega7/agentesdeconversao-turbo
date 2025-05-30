import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preços | Agentes de Conversão',
  description: 'Planos e preços da plataforma de agentes IA'
}

export default function PrecosPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">
        Planos que Escalam com Você
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="text-center p-8 border rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Starter</h3>
          <p className="text-3xl font-bold mb-6">R$ 97<span className="text-sm">/mês</span></p>
          <ul className="space-y-2 text-left">
            <li>✓ 3 agentes ativos</li>
            <li>✓ 1.000 conversas/mês</li>
            <li>✓ Integrações básicas</li>
            <li>✓ Suporte por email</li>
          </ul>
        </div>
        
        <div className="text-center p-8 border-2 border-primary rounded-lg relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm">
            Mais Popular
          </div>
          <h3 className="text-2xl font-bold mb-4">Professional</h3>
          <p className="text-3xl font-bold mb-6">R$ 297<span className="text-sm">/mês</span></p>
          <ul className="space-y-2 text-left">
            <li>✓ 10 agentes ativos</li>
            <li>✓ 10.000 conversas/mês</li>
            <li>✓ Todas as integrações</li>
            <li>✓ Agent Studio avançado</li>
            <li>✓ Analytics completo</li>
            <li>✓ Suporte prioritário</li>
          </ul>
        </div>
        
        <div className="text-center p-8 border rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
          <p className="text-3xl font-bold mb-6">Customizado</p>
          <ul className="space-y-2 text-left">
            <li>✓ Agentes ilimitados</li>
            <li>✓ Conversas ilimitadas</li>
            <li>✓ White-label</li>
            <li>✓ SLA dedicado</li>
            <li>✓ Integração customizada</li>
            <li>✓ Suporte 24/7</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
