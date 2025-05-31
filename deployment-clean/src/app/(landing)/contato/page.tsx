export default function ContatoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Contato</h1>
      <div className="max-w-2xl">
        <p className="text-gray-600 mb-6">
          Entre em contato conosco para conhecer mais sobre nossa plataforma de agentes de IA.
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Email</h3>
            <p className="text-gray-600">contato@agentesdeconversao.ai</p>
          </div>
          <div>
            <h3 className="font-semibold">WhatsApp</h3>
            <p className="text-gray-600">+55 (11) 9999-9999</p>
          </div>
        </div>
      </div>
    </div>
  )
}