import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics | Dashboard',
  description: 'Analytics e métricas dos agentes IA'
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho dos seus agentes em tempo real
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">
            Conversas Hoje
          </h3>
          <p className="text-3xl font-bold">1,234</p>
          <p className="text-sm text-green-600">+12% vs ontem</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">
            Taxa de Resolução
          </h3>
          <p className="text-3xl font-bold">94%</p>
          <p className="text-sm text-green-600">+2% vs semana passada</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tempo Médio de Resposta
          </h3>
          <p className="text-3xl font-bold">1.2s</p>
          <p className="text-sm text-green-600">-0.3s vs média</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">
            Satisfação do Cliente
          </h3>
          <p className="text-3xl font-bold">4.8</p>
          <p className="text-sm text-muted-foreground">de 5.0</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Conversas por Hora</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            [Gráfico de linha - Conversas por Hora]
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Top Agentes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Suporte Geral</span>
              <span className="font-semibold">456 conversas</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Vendas Bot</span>
              <span className="font-semibold">321 conversas</span>
            </div>
            <div className="flex justify-between items-center">
              <span>FAQ Automático</span>
              <span className="font-semibold">234 conversas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
