'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse delay-300"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm mb-6">
          <Sparkles className="h-4 w-4" />
          <span>Oferta Especial - 30 dias grátis</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Pronto para Aumentar suas Conversões?
        </h2>
        
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Junte-se a mais de 1000+ empresas que já transformaram seu atendimento com nossos agentes de IA
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold group">
            <Link href="/signup" className="inline-flex items-center gap-2">
              Começar Teste Grátis
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold">
            <Link href="/contato">Falar com Especialista</Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex justify-center items-center gap-8 flex-wrap opacity-80">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Setup em 5 minutos</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Sem compromisso</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>Suporte incluído</span>
          </div>
        </div>
      </div>
    </section>
  )
}