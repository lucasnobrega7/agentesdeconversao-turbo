'use client'

import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Plug } from 'lucide-react'

interface IntegrationNodeProps {
  data: {
    label: string
    integrationType?: string
    endpoint?: string
    method?: string
  }
  selected?: boolean
}

export function IntegrationNode({ data, selected }: IntegrationNodeProps) {
  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
        selected ? 'border-primary' : 'border-stone-400'
      }`}
    >
      <div className="flex items-center gap-2">
        <Plug className="w-4 h-4" />
        <div className="text-sm font-bold">{data.label}</div>
      </div>
      
      {data.integrationType && (
        <div className="text-xs text-gray-500 mt-1">
          {data.integrationType}
        </div>
      )}
      
      {data.endpoint && (
        <div className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">
          {data.method || 'GET'} {data.endpoint}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-purple-500"
      />
    </div>
  )
}
