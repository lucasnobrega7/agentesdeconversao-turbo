'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Bot, MessageSquare, BarChart3, Link } from 'lucide-react'

export function FeaturesGrid() {
  const features = [
    {
      title: "IA Avançada",
      description: "Agentes inteligentes powered by GPT-4 e Claude",
      icon: Bot,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Multi-Canal",
      description: "WhatsApp, Telegram, webchat e mais",
      icon: MessageSquare,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Analytics Real-time",
      description: "Dashboard completo com métricas de conversão",
      icon: BarChart3,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Fácil Integração",
      description: "APIs REST e webhooks para qualquer sistema",
      icon: Link,
      color: "from-orange-500 to-orange-600"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Recursos que Fazem a Diferença
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Nossa plataforma oferece tudo que você precisa para criar agentes de IA que convertem
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        <div className="mt-20 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-blue-600">99.9%</div>
              <p className="text-sm text-gray-600">Uptime garantido</p>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-green-600">&lt;2s</div>
              <p className="text-sm text-gray-600">Tempo de resposta</p>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <p className="text-sm text-gray-600">Suporte disponível</p>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-orange-600">7+</div>
              <p className="text-sm text-gray-600">Modelos de IA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}