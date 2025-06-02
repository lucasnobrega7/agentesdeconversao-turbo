import React from "react"
import { NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"
import { Input } from "@/components/ui/input"

export const WebhookNode = (props: NodeProps) => {
  const { data } = props as { data: CustomNodeData }
  return (
    <NodeWrapper {...props} title="Webhook" iconName="Webhook" hasInputHandle={false}>
      <Input
        placeholder="URL do Webhook"
        defaultValue={data.url || ""}
        className="text-xs"
        readOnly // Configuration should be in properties panel
      />
      <p className="mt-1 text-muted-foreground text-xs">Recebe dados de um webhook.</p>
    </NodeWrapper>
  )
}
