export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Painel administrativo do sistema Agentes de Conversão
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-blue-600">156</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-green-600">43</div>
          <div className="text-sm text-muted-foreground">Organizations</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-purple-600">289</div>
          <div className="text-sm text-muted-foreground">Total Agents</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-orange-600">12,456</div>
          <div className="text-sm text-muted-foreground">Conversations</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>API Status</span>
              <span className="text-green-600">✅ Online</span>
            </div>
            <div className="flex justify-between">
              <span>Database</span>
              <span className="text-green-600">✅ Connected</span>
            </div>
            <div className="flex justify-between">
              <span>Supabase</span>
              <span className="text-yellow-600">🟡 Connecting</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-muted-foreground">
            Sistema de logs será implementado na Fase 3
          </p>
        </div>
      </div>
    </div>
  )
}