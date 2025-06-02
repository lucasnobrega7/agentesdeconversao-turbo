import React from "react"
import { NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"
import { Badge } from "@/components/ui/badge"

export interface ToolNodeData extends CustomNodeData {
  toolName?: string
  inputParams?: Record<string, any>
}

export const ToolNode = (props: NodeProps) => {
  const { data } = props as { data: ToolNodeData }
  return (
    <NodeWrapper
      {...props}
      title="Executar Ferramenta"
      iconName="TerminalSquare"
      data={{ ...data, color: data.color || "#10B981" }} // Green accent for Tools
    >
      <div className="space-y-1">
        <p className="font-medium text-foreground">{data.toolName || "Ferramenta não selecionada"}</p>
        {data.inputParams && Object.keys(data.inputParams).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(data.inputParams).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {String(value).substring(0, 20)}
                {String(value).length > 20 ? "..." : ""}
              </Badge>
            ))}
          </div>
        )}
        {!data.inputParams ||
          (Object.keys(data.inputParams).length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum parâmetro de entrada configurado.</p>
          ))}
      </div>
    </NodeWrapper>
  )
}
