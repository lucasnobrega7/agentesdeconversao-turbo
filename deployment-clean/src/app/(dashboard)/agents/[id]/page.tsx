interface AgentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Agente #{id}</h1>
          <p className="text-gray-600 mt-1">Suporte ao Cliente</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm">
            Testar
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
            Editar
          </button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Informações Gerais</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Ativo
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Modelo:</span>
              <span className="ml-2">GPT-4</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Criado em:</span>
              <span className="ml-2">15/01/2024</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Última atualização:</span>
              <span className="ml-2">20/01/2024</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Conversas hoje:</span>
              <span className="font-semibold">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total de conversas:</span>
              <span className="font-semibold">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Taxa de satisfação:</span>
              <span className="font-semibold text-green-600">94%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Tempo médio de resposta:</span>
              <span className="font-semibold">2.3s</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Prompt do Sistema</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-gray-700 whitespace-pre-wrap">
            Você é um assistente especializado em suporte ao cliente. 
            Responda sempre de forma educada, clara e objetiva.
            Se não souber uma resposta, seja honesto e ofereça alternativas.
          </p>
        </div>
      </div>
    </div>
  )
}