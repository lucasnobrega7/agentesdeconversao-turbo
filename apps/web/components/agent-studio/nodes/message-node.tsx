import React from "react"
import { NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"

export interface MessageNodeData extends CustomNodeData {
  message?: string
  channel?: string
}

export const MessageNode = (props: NodeProps) => {
  const { data } = props as unknown as { data: MessageNodeData }
  return (
    <NodeWrapper
      data={{ ...data, color: data.color || "#0EA5E9" }}
      selected={props.selected}
      title="Enviar Mensagem"
      iconName="MessageSquare"
    >
      <p className="text-muted-foreground line-clamp-3">{data.message || "Mensagem não configurada."}</p>
      {data.channel && <p className="mt-1 text-xs text-blue-500">Canal: {data.channel}</p>}
    </NodeWrapper>
  )
}
