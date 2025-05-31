export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu sistema de agentes de IA
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-blue-600">4</div>
          <div className="text-sm text-muted-foreground">Agentes Ativos</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-green-600">1,234</div>
          <div className="text-sm text-muted-foreground">Conversas Hoje</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-purple-600">89%</div>
          <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-orange-600">R$ 12,456</div>
          <div className="text-sm text-muted-foreground">Receita Gerada</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
        <p className="text-muted-foreground">
          Dashboard em desenvolvimento - Funcionalidades avançadas serão implementadas na Fase 3
        </p>
      </div>
    </div>
  )
}