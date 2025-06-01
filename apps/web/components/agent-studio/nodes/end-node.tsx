import type React from "react"
import type { NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"

export const EndNode: React.FC<NodeProps<CustomNodeData>> = (props) => {
  return (
    <NodeWrapper {...props} title="Fim" iconName="CheckCircle" hasOutputHandle={false}>
      <p className="text-muted-foreground">O ponto final do seu fluxo.</p>
    </NodeWrapper>
  )
}
