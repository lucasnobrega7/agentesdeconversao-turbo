import React from "react"
import { NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"

export const EndNode = (props: NodeProps<CustomNodeData>) => {
  return (
    <NodeWrapper {...props} title="Fim" iconName="CheckCircle" hasOutputHandle={false}>
      <p className="text-muted-foreground">O ponto final do seu fluxo.</p>
    </NodeWrapper>
  )
}
