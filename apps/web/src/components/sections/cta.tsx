export function CtaSection() {
  return (
    <section className="py-20 bg-blue-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Pronto para Aumentar suas Conversões?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Junte-se a mais de 1000+ empresas que já transformaram seu atendimento com nossos agentes de IA
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold">
            Começar Teste Grátis
          </button>
          <button className="border border-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold">
            Falar com Especialista
          </button>
        </div>
      </div>
    </section>
  )
}