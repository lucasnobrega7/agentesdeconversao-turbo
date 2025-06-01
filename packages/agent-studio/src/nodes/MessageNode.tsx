'use client'

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { MessageSquare } from 'lucide-react'

export function MessageNode({ data, selected }: NodeProps) {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-lg border-2 p-4 min-w-[200px]
        ${selected ? 'border-blue-500 shadow-xl' : 'border-gray-200'}
        hover:shadow-xl transition-all duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-blue-500 rounded-lg text-white">
          <MessageSquare size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {data.label || 'Mensagem'}
          </h3>
          <p className="text-xs text-gray-500">Enviar mensagem</p>
        </div>
      </div>
      
      {data.message && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 line-clamp-2">
          {data.message}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  )
}
