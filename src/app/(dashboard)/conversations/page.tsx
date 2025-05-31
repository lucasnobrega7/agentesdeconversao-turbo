import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conversas | Dashboard',
  description: 'Gerencie todas as conversas dos agentes'
}

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conversas</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore todas as conversas em andamento
          </p>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-md hover:bg-muted">
            Filtros
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Nova Conversa
          </button>
        </div>
      </div>
      
      <div className="flex gap-4 border-b">
        <button className="px-4 py-2 border-b-2 border-primary text-primary font-medium">
          Ativas (24)
        </button>
        <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
          Arquivadas
        </button>
        <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
          Aguardando
        </button>
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Cliente #{1000 + i}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Ativa
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Última mensagem: Preciso de ajuda com meu pedido...
                </p>
                <p className="text-xs text-muted-foreground">
                  Agente: Suporte Geral • há 2 minutos
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium">14:32</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
