'use client'

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Globe } from 'lucide-react'

export function APINode({ data, selected }: NodeProps) {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-lg border-2 p-4 min-w-[200px]
        ${selected ? 'border-green-500 shadow-xl' : 'border-gray-200'}
        hover:shadow-xl transition-all duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-green-500 rounded-lg text-white">
          <Globe size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {data.label || 'API Call'}
          </h3>
          <p className="text-xs text-gray-500">Chamada externa</p>
        </div>
      </div>
      
      {data.url && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {data.method || 'GET'}
            </span>
          </div>
          <div className="text-xs text-gray-700 truncate">
            {data.url}
          </div>
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        className="w-3 h-3 !bg-red-500 border-2 border-white"
        style={{ left: '70%' }}
      />
    </div>
  )
}
