import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações | Dashboard',
  description: 'Configurações da conta e organização'
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <nav className="space-y-1">
            <a href="#profile" className="block px-3 py-2 rounded-md bg-muted font-medium">
              Perfil
            </a>
            <a href="#security" className="block px-3 py-2 rounded-md hover:bg-muted">
              Segurança
            </a>
            <a href="#notifications" className="block px-3 py-2 rounded-md hover:bg-muted">
              Notificações
            </a>
            <a href="#integrations" className="block px-3 py-2 rounded-md hover:bg-muted">
              Integrações
            </a>
            <a href="#billing" className="block px-3 py-2 rounded-md hover:bg-muted">
              Faturamento
            </a>
          </nav>
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Informações do Perfil</h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    defaultValue="Lucas Nóbrega"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="lucas@agentesdeconversao.ai"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Organização
                </label>
                <input
                  type="text"
                  defaultValue="Agentes de Conversão"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fuso Horário
                </label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>America/Sao_Paulo (GMT-3)</option>
                  <option>America/New_York (GMT-5)</option>
                  <option>Europe/London (GMT+0)</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
