import { LoadingIndicator } from "@/components/global/loading-indicator"

export default function ExampleLoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center p-10 border rounded-lg min-h-[300px]">
      <h2 className="text-xl font-semibold mb-6">Página de Exemplo com Loading</h2>

      <p className="text-muted-foreground mb-4">Abaixo está um indicador de loading simples:</p>
      <LoadingIndicator text="Buscando informações do agente..." />

      <p className="text-muted-foreground mt-8 mb-4">Indicador de loading em tela cheia (simulado em um container):</p>
      <div className="relative w-full h-64 border rounded-md overflow-hidden bg-background">
        <LoadingIndicator fullScreen text="Processando seu fluxo..." />
        <div className="p-4">
          <p className="text-sm">Conteúdo da página por baixo do loader...</p>
        </div>
      </div>
    </div>
  )
}
