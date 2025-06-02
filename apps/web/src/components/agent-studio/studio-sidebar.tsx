"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, MessageSquare, FileText, Zap, Database, Globe } from "lucide-react"

const nodeTypes = [
  {
    type: 'agent',
    label: 'Agente',
    icon: Bot,
    description: 'Adicione um agente ao fluxo'
  },
  {
    type: 'message',
    label: 'Mensagem',
    icon: MessageSquare,
    description: 'Envie uma mensagem'
  },
  {
    type: 'document',
    label: 'Documento',
    icon: FileText,
    description: 'Processe um documento'
  },
  {
    type: 'action',
    label: 'Ação',
    icon: Zap,
    description: 'Execute uma ação'
  },
  {
    type: 'database',
    label: 'Database',
    icon: Database,
    description: 'Consulte dados'
  },
  {
    type: 'api',
    label: 'API',
    icon: Globe,
    description: 'Faça uma chamada API'
  },
]

export function StudioSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Componentes</h2>
        <p className="text-sm text-muted-foreground">
          Arraste para adicionar ao fluxo
        </p>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-4">
          {nodeTypes.map((node) => (
            <Card
              key={node.type}
              className="cursor-move hover:border-primary transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <node.icon className="h-4 w-4" />
                  {node.label}
                </CardTitle>
                <CardDescription className="text-xs">
                  {node.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}