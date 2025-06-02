import React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { NodeWrapper, type CustomNodeData } from "./node-wrapper"

export interface ConditionNodeData extends CustomNodeData {
  condition?: string
}

export const ConditionNode = (props: NodeProps) => {
  const { data } = props as { data: ConditionNodeData }
  return (
    <NodeWrapper
      {...props}
      title="Condição"
      iconName="GitFork"
      hasOutputHandle={false}
      data={{ ...data, color: data.color || "#F59E0B" }} // Amber accent for Logic
    >
      <p className="text-muted-foreground line-clamp-2">{data.condition || "Condição não configurada."}</p>
      <div className="mt-2 flex flex-col space-y-1.5">
        <div className="relative flex items-center justify-end group">
          <span className="mr-2 text-xs text-muted-foreground group-hover:text-green-600">Verdadeiro</span>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="!relative !transform-none !right-0 !top-0 !h-full !w-3 !rounded-none !border-none !bg-transparent hover:!bg-green-500/20 transition-colors"
            style={{ right: "-6px" }}
          />
        </div>
        <div className="relative flex items-center justify-end group">
          <span className="mr-2 text-xs text-muted-foreground group-hover:text-red-600">Falso</span>
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="!relative !transform-none !right-0 !top-0 !h-full !w-3 !rounded-none !border-none !bg-transparent hover:!bg-red-500/20 transition-colors"
            style={{ right: "-6px" }}
          />
        </div>
      </div>
    </NodeWrapper>
  )
}
