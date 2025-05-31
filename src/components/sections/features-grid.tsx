export function FeaturesGrid() {
  const features = [
    {
      title: "IA Avançada",
      description: "Agentes inteligentes powered by GPT-4 e Claude",
      icon: "🤖"
    },
    {
      title: "Multi-Canal",
      description: "WhatsApp, Telegram, webchat e mais",
      icon: "💬"
    },
    {
      title: "Analytics Real-time",
      description: "Dashboard completo com métricas de conversão",
      icon: "📊"
    },
    {
      title: "Fácil Integração",
      description: "APIs REST e webhooks para qualquer sistema",
      icon: "🔗"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Recursos que Fazem a Diferença
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}