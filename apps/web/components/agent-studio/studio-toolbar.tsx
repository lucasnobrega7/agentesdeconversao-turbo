"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useStudioStore } from "@/stores/studio-store"
import { Play, Undo, Redo, Settings, History, UploadCloud, DownloadCloud } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StudioToolbarProps {
  agentId: string
  flowName?: string // Optional: display flow name
}

export function StudioToolbar({ agentId, flowName = "Fluxo Principal" }: StudioToolbarProps) {
  const { undo, redo, nodes, edges, takeSnapshot } = useStudioStore((state) => ({
    undo: state.undo,
    redo: state.redo,
    nodes: state.nodes,
    edges: state.edges,
    takeSnapshot: state.takeSnapshot, // Ensure takeSnapshot is used for explicit save
  }))

  const handleSave = () => {
    takeSnapshot() // Explicitly save current state to history before "API call"
    console.log("Saving flow for agent:", agentId, { nodes, edges })
    toast({
      title: "Fluxo Salvo!",
      description: "Suas alterações foram salvas com sucesso.",
      variant: "default",
    })
  }

  const handlePublish = () => {
    console.log("Publishing flow for agent:", agentId)
    toast({
      title: "Fluxo Publicado!",
      description: "Seu fluxo está ativo e pronto para receber interações.",
      variant: "default",
      className: "bg-green-500 text-white",
    })
  }

  const handleSimulate = () => {
    console.log("Simulating flow for agent:", agentId)
    toast({
      title: "Simulação Iniciada",
      description: "O modo de simulação está ativo.",
    })
  }

  return (
    <div className="flex h-14 items-center justify-between border-b bg-card px-3 md:px-4">
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="sm" onClick={undo} className="text-xs px-2" title="Desfazer (Ctrl+Z)">
          <Undo className="mr-0 md:mr-1.5 h-3.5 w-3.5" /> <span className="hidden md:inline">Desfazer</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} className="text-xs px-2" title="Refazer (Ctrl+Y)">
          <Redo className="mr-0 md:mr-1.5 h-3.5 w-3.5" /> <span className="hidden md:inline">Refazer</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs px-2">
              <History className="mr-0 md:mr-1.5 h-3.5 w-3.5" /> <span className="hidden md:inline">Versões</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel className="text-xs">Histórico de Versões</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">Versão 3 (Atual)</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Versão 2 (Há 2 horas)</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Versão 1 (Ontem)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">Ver todas as versões...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden md:flex items-center gap-2 text-center">
        <span className="text-sm font-medium truncate max-w-[200px] lg:max-w-[300px]" title={flowName}>
          {flowName}
        </span>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="outline" size="sm" onClick={handleSimulate} className="text-xs px-2">
          <Play className="mr-0 md:mr-1.5 h-3.5 w-3.5" /> <span className="hidden md:inline">Simular</span>
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="text-xs px-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
        >
          <DownloadCloud className="mr-0 md:mr-1.5 h-3.5 w-3.5" />{" "}
          <span className="hidden md:inline">Salvar Rascunho</span>
        </Button>
        <Button size="sm" onClick={handlePublish} className="text-xs px-2">
          <UploadCloud className="mr-0 md:mr-1.5 h-3.5 w-3.5" /> <span className="hidden md:inline">Publicar</span>
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1 hidden md:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configurações do Fluxo</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs">Configurações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">Geral</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Variáveis de Ambiente</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Integrações</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <Button variant="ghost" size="icon" className="h-8 w-8">
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Compartilhar</span>
      </Button> */}
      </div>
    </div>
  )
}
