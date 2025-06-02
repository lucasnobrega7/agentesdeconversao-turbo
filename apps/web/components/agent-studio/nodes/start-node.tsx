import React from "react"
import { NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"

export const StartNode: React.FC<NodeProps<CustomNodeData>> = (props) => {
  return (
    <NodeWrapper {...props} title="Início" iconName="Play" hasInputHandle={false}>
      <p className="text-muted-foreground">O ponto de partida do seu fluxo.</p>
    </NodeWrapper>
  )
}
