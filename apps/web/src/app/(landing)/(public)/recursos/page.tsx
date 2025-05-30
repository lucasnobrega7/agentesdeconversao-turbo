import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recursos | Agentes de Conversão',
  description: 'Recursos e funcionalidades da plataforma de agentes IA'
}

export default function RecursosPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">
        Recursos Poderosos para Agentes IA
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="text-center p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Agent Studio Visual</h3>
          <p className="text-muted-foreground">
            Editor visual drag-and-drop para criar fluxos de conversação complexos
          </p>
        </div>
        
        <div className="text-center p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Multi-Channel</h3>
          <p className="text-muted-foreground">
            WhatsApp, Telegram, Web Chat e mais - tudo integrado
          </p>
        </div>
        
        <div className="text-center p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Analytics Enterprise</h3>
          <p className="text-muted-foreground">
            Dashboards em tempo real com métricas avançadas
          </p>
        </div>
      </div>
    </div>
  )
}
