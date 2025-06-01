'use client'

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { GitBranch } from 'lucide-react'

export function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-lg border-2 p-4 min-w-[220px]
        ${selected ? 'border-yellow-500 shadow-xl' : 'border-gray-200'}
        hover:shadow-xl transition-all duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-yellow-500 rounded-lg text-white">
          <GitBranch size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {data.label || 'Condição'}
          </h3>
          <p className="text-xs text-gray-500">Lógica condicional</p>
        </div>
      </div>
      
      {data.conditionValue && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
          <span className="font-medium">{data.conditionType || 'contém'}</span>: {data.conditionValue}
        </div>
      )}
      
      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <span>Verdadeiro</span>
        <span>Falso</span>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 !bg-red-500 border-2 border-white"
        style={{ left: '70%' }}
      />
    </div>
  )
}
