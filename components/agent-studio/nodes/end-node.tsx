import React from "react"
import { NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"

export const EndNode = (props: NodeProps) => {
  const { data } = props as unknown as { data: CustomNodeData }
  return (
    <NodeWrapper data={data} selected={props.selected} title="Fim" iconName="CheckCircle" hasOutputHandle={false}>
      <p className="text-muted-foreground">O ponto final do seu fluxo.</p>
    </NodeWrapper>
  )
}
