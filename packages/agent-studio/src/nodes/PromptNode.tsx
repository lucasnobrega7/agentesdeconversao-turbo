'use client'

import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { FileText } from 'lucide-react'

interface PromptNodeProps {
  data: {
    label: string
    prompt?: string
    temperature?: number
    maxTokens?: number
  }
  selected?: boolean
}

export function PromptNode({ data, selected }: PromptNodeProps) {
  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
        selected ? 'border-primary' : 'border-stone-400'
      }`}
    >
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <div className="text-sm font-bold">{data.label}</div>
      </div>
      
      {data.prompt && (
        <div className="text-xs text-gray-500 mt-2 max-w-[200px] truncate">
          {data.prompt}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  )
}
