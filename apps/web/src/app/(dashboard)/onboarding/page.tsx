export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Bem-vindo aos Agentes de Conversão!</h1>
        <p className="text-gray-600">
          Vamos configurar sua conta em alguns passos simples.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold">Configurar Perfil</h3>
              <p className="text-gray-600 text-sm">Complete suas informações básicas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold">Criar Primeiro Agente</h3>
              <p className="text-gray-600 text-sm">Configure seu primeiro agente de IA</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold">Integrar Canais</h3>
              <p className="text-gray-600 text-sm">Conecte WhatsApp, Telegram ou webchat</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Pular Tutorial
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
            Começar
          </button>
        </div>
      </div>
    </div>
  )
}