export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Faturamento</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Plano Atual</h2>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-blue-600">Enterprise</p>
            <p className="text-gray-600">R$ 499/mês</p>
            <p className="text-sm text-gray-500">Próxima cobrança: 15/02/2024</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Uso do Mês</h2>
          <div className="space-y-2">
            <p>Conversas: <span className="font-semibold">1,250 / 10,000</span></p>
            <p>Agentes: <span className="font-semibold">5 / 50</span></p>
            <p>Storage: <span className="font-semibold">2.1GB / 100GB</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}