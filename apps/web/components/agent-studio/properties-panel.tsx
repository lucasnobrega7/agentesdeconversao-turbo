"use client"
import type { Node } from "@xyflow/react"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useStudioStore } from "@/stores/studio-store"
import { Delete, Palette, Trash2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface PropertiesPanelProps {
  node: Node
}

const availableColors = [
  { name: "Padrão", value: undefined },
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#10B981" },
  { name: "Amarelo", value: "#F59E0B" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Ciano", value: "#06B6D4" },
]

export function PropertiesPanel({ node }: PropertiesPanelProps) {
  const { updateNodeData, deleteNode } = useStudioStore((state) => ({
    updateNodeData: state.updateNodeData,
    deleteNode: state.deleteNode,
  }))

  const handleInputChange = (field: string, value: string | number | boolean | undefined) => {
    updateNodeData(node.id, { ...node.data, [field]: value })
  }

  const handleJsonInputChange = (field: string, value: string) => {
    try {
      const parsedValue = JSON.parse(value)
      updateNodeData(node.id, { ...node.data, [field]: parsedValue })
    } catch (error) {
      // Handle JSON parsing error, e.g., show a toast or an inline error message
      console.error("Invalid JSON input for field:", field, error)
      // Optionally, update with raw string if parsing fails and you want to allow partial input
      // updateNodeData(node.id, { ...node.data, [`${field}_raw`]: value });
    }
  }

  const renderNodeSpecificFields = () => {
    switch (node.type) {
      case "aiResponseNode":
        return (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={`prompt-${node.id}`} className="text-xs">
                Prompt
              </Label>
              <Textarea
                id={`prompt-${node.id}`}
                placeholder="Prompt para a IA"
                value={node.data.prompt || ""}
                onChange={(e) => handleInputChange("prompt", e.target.value)}
                className="min-h-[100px] text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`model-${node.id}`} className="text-xs">
                Modelo de IA
              </Label>
              <Input
                id={`model-${node.id}`}
                placeholder="ex: gpt-4o"
                value={node.data.model || ""}
                onChange={(e) => handleInputChange("model", e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`temperature-${node.id}`} className="text-xs">
                Temperatura ({node.data.temperature || 0.7})
              </Label>
              <Slider
                id={`temperature-${node.id}`}
                min={0}
                max={1}
                step={0.1}
                defaultValue={[node.data.temperature || 0.7]}
                onValueChange={(value) => handleInputChange("temperature", value[0])}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`maxTokens-${node.id}`} className="text-xs">
                Max Tokens
              </Label>
              <Input
                id={`maxTokens-${node.id}`}
                type="number"
                placeholder="ex: 512"
                value={node.data.maxTokens || ""}
                onChange={(e) => handleInputChange("maxTokens", Number.parseInt(e.target.value, 10))}
                className="text-xs h-9"
              />
            </div>
          </>
        )
      case "conditionNode":
        return (
          <div className="space-y-1.5">
            <Label htmlFor={`condition-${node.id}`} className="text-xs">
              Condição (JavaScript)
            </Label>
            <Textarea
              id={`condition-${node.id}`}
              placeholder="Ex: {{variavel}} === 'valor' && {{outra_variavel}} > 10"
              value={node.data.condition || ""}
              onChange={(e) => handleInputChange("condition", e.target.value)}
              className="min-h-[60px] text-xs font-mono"
            />
            <p className="text-xs text-muted-foreground">Use {"{{variavel}}"} para acessar dados.</p>
          </div>
        )
      case "webhookNode":
        return (
          <div className="space-y-1.5">
            <Label htmlFor={`url-${node.id}`} className="text-xs">
              URL do Webhook
            </Label>
            <Input
              id={`url-${node.id}`}
              placeholder="https://seu.webhook/url"
              value={node.data.url || ""}
              onChange={(e) => handleInputChange("url", e.target.value)}
              className="text-xs h-9"
            />
            <p className="text-xs text-muted-foreground">Este nó será acionado quando esta URL receber um POST.</p>
          </div>
        )
      case "messageNode":
        return (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={`message-${node.id}`} className="text-xs">
                Conteúdo da Mensagem
              </Label>
              <Textarea
                id={`message-${node.id}`}
                placeholder="Use {{variavel}} para inserir dados dinâmicos."
                value={node.data.message || ""}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="min-h-[100px] text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`channel-${node.id}`} className="text-xs">
                Canal (Opcional)
              </Label>
              <Input
                id={`channel-${node.id}`}
                placeholder="ex: whatsapp, telegram"
                value={node.data.channel || ""}
                onChange={(e) => handleInputChange("channel", e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </>
        )
      case "toolNode":
        return (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={`toolName-${node.id}`} className="text-xs">
                Nome da Ferramenta
              </Label>
              <Input
                id={`toolName-${node.id}`}
                placeholder="ex: buscar_cliente_crm"
                value={node.data.toolName || ""}
                onChange={(e) => handleInputChange("toolName", e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`inputParams-${node.id}`} className="text-xs">
                Parâmetros de Entrada (JSON)
              </Label>
              <Textarea
                id={`inputParams-${node.id}`}
                placeholder={'{\n  "customerId": "{{user_id}}",\n  "query": "status do pedido"\n}'}
                value={node.data.inputParams ? JSON.stringify(node.data.inputParams, null, 2) : ""}
                onChange={(e) => handleJsonInputChange("inputParams", e.target.value)}
                className="min-h-[100px] text-xs font-mono"
              />
            </div>
          </>
        )
      default:
        return <p className="text-xs text-muted-foreground">Nenhuma propriedade específica para este nó.</p>
    }
  }

  return (
    <aside className="w-80 border-l bg-card flex flex-col shadow-xl z-10">
      <CardHeader className="border-b p-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sm">Propriedades</CardTitle>
            <CardDescription className="text-xs">{node.data.label || node.type || "Nó Selecionado"}</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-4 gap-1">
                {availableColors.map((color) => (
                  <Button
                    key={color.name}
                    variant="outline"
                    size="icon"
                    className={cn("h-7 w-7 rounded-full", node.data.color === color.value && "ring-2 ring-ring")}
                    style={{ backgroundColor: color.value || undefined }}
                    onClick={() => handleInputChange("color", color.value)}
                    title={color.name}
                  >
                    {!color.value && <Delete className="h-3 w-3" />}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-3 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`label-${node.id}`} className="text-xs">
              Rótulo do Nó
            </Label>
            <Input
              id={`label-${node.id}`}
              value={node.data.label || ""}
              onChange={(e) => handleInputChange("label", e.target.value)}
              className="text-xs h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`description-${node.id}`} className="text-xs">
              Descrição (Opcional)
            </Label>
            <Textarea
              id={`description-${node.id}`}
              placeholder="Uma breve descrição da função deste nó."
              value={node.data.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[60px] text-xs"
            />
          </div>
          {renderNodeSpecificFields()}
        </CardContent>
      </ScrollArea>
      <CardFooter className="p-3 border-t">
        <Button variant="destructive" size="sm" className="w-full text-xs" onClick={() => deleteNode(node.id)}>
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Excluir Nó
        </Button>
      </CardFooter>
    </aside>
  )
}
