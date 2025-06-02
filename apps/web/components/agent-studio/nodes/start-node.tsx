import React from "react"
import { NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"

export const StartNode = (props: NodeProps) => {
  const { data } = props as unknown as { data: CustomNodeData }
  return (
    <NodeWrapper data={data} selected={props.selected} title="Início" iconName="Play" hasInputHandle={false}>
      <p className="text-muted-foreground">O ponto de partida do seu fluxo.</p>
    </NodeWrapper>
  )
}
