import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <nav className="px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          Agentes de Conversão
        </Link>
        <div className="flex gap-4">
          <Link href="/precos">
            <Button variant="ghost" className="text-white">Preços</Button>
          </Link>
          <Link href="/recursos">
            <Button variant="ghost" className="text-white">Recursos</Button>
          </Link>
          <Link href="https://login.agentesdeconversao.ai">
            <Button variant="outline" className="border-white text-white">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          A História que Outros CTOs
          <br />
          <span className="text-emerald-400">Não Querem que Você Saiba</span>
        </h1>
        
        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-xl text-slate-300 leading-relaxed mb-8">
            Enquanto todo mundo brincava de fazer chatbot com template do YouTube, 
            nós estávamos construindo a arquitetura que outros levam anos para entender.
          </p>

          <h2 className="text-3xl font-bold text-white mb-6">
            Por Que Começamos Esta Revolução
          </h2>
          
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Em 2023, percebemos que 99% dos "sistemas de IA" no mercado eram piada. 
            Chatbots que não entendem contexto, interfaces que parecem dos anos 90, 
            e arquiteturas que quebram com 100 usuários simultâneos.
          </p>

          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Aí nos perguntamos: <strong className="text-emerald-400">
            "E se construíssemos um sistema que outros CTOs de BigTech vão querer copiar?"</strong>
          </p>

          <h2 className="text-3xl font-bold text-white mb-6">
            O Que Nos Torna Diferentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-emerald-400 mb-4">
                Outros Sistemas
              </h3>
              <ul className="text-slate-300 space-y-2">
                <li>• Template WordPress com chatbot grudado</li>
                <li>• "IA" que é busca de palavra-chave</li>
                <li>• Interface que ofende qualquer designer</li>
                <li>• Arquitetura que quebra com 50 usuários</li>
                <li>• Suporte que responde em 48 horas</li>
              </ul>
            </div>

            <div className="bg-emerald-900 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Agentes de Conversão
              </h3>
              <ul className="text-emerald-100 space-y-2">
                <li>• Arquitetura enterprise scalável</li>
                <li>• Vector search que entende contexto real</li>
                <li>• Interface que faz Apple ter inveja</li>
                <li>• Sistema que aguenta milhões de usuários</li>
                <li>• Suporte que responde antes de você perguntar</li>
              </ul>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-6">
            Nossa Obsessão por Excelência
          </h2>
          
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Não lançamos nada que não usaríamos em uma empresa de bilhões. 
            Cada linha de código é revisada como se fosse para o Google. 
            Cada interface é desenhada como se fosse para a Apple.
          </p>

          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            <strong className="text-emerald-400">Por quê?</strong> Porque mediocridade 
            é a peste do mercado. Se você não pode competir com BigTech em qualidade, 
            não deveria estar no jogo.
          </p>

          <h2 className="text-3xl font-bold text-white mb-6">
            Para Quem Este Sistema Foi Criado
          </h2>
          
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Não é para todo mundo. É para empresas que querem estar entre as melhores. 
            Para CTOs que não aceitam mediocridade. Para organizações que preferem 
            pagar mais por algo que funciona do que economizar com algo que quebra.
          </p>

          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Se você está procurando o chatbot mais barato do mercado, 
            este não é o lugar certo. Mas se quer o sistema que seus 
            concorrentes vão tentar copiar (e falhar), bem-vindo ao futuro.
          </p>

          <div className="text-center">
            <Link href="https://dash.agentesdeconversao.ai">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 text-lg">
                Pronto para o Próximo Nível?
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400">
            © 2024 Agentes de Conversão. Sistema que outros CTOs tentam copiar.
          </p>
        </div>
      </footer>
    </div>
  )
}