"use client"

import React from "react"
import { NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"
import { Badge } from "@/components/ui/badge"

// Example specific data for AIResponseNode
export interface AIResponseNodeData extends CustomNodeData {
  prompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export const AIResponseNode = (props: NodeProps) => {
  const { data } = props as unknown as { data: AIResponseNodeData }
  return (
    <NodeWrapper
      data={{ ...data, color: data.color || "#8B5CF6" }}
      selected={props.selected}
      title="Resposta IA"
      iconName="Brain"
    >
      <div className="space-y-2">
        <p className="text-muted-foreground line-clamp-2">{String(data.prompt) || "Prompt não configurado."}</p>
        <div className="flex flex-wrap gap-1">
          {String(data.model) && (
            <Badge variant="outline" className="text-xs">
              Modelo: {String(data.model)}
            </Badge>
          )}
          {String(data.temperature !== undefined) && (
            <Badge variant="outline" className="text-xs">
              Temp: {String(data.temperature)}
            </Badge>
          )}
          {String(data.maxTokens !== undefined) && (
            <Badge variant="outline" className="text-xs">
              Tokens: {String(data.maxTokens)}
            </Badge>
          )}
        </div>
      </div>
    </NodeWrapper>
  )
}
