export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chaves de API</h1>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Suas Chaves de API</h2>
        <p className="text-gray-600 mb-6">
          Gerencie suas chaves de API para integração com sistemas externos.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Gerar Nova Chave
        </button>
      </div>
    </div>
  )
}