"use client"

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { Zap, Database, Globe, FileJson } from 'lucide-react'

const actionIcons = {
  api: Globe,
  database: Database,
  webhook: Zap,
  function: FileJson,
}

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const Icon = actionIcons[data.actionType as keyof typeof actionIcons] || Zap
  
  return (
    <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-green-500" />
        <h3 className="font-semibold">{String(data.label) || 'Ação'}</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Tipo:</span>
          <span className="ml-2 font-medium">{String(data.actionType) || 'API'}</span>
        </div>
        
        {String(data.endpoint) && (
          <div className="p-2 bg-muted rounded">
            <code className="text-xs">{String(data.endpoint)}</code>
          </div>
        )}
        
        {String(data.method) && (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs rounded font-medium
              ${String(data.method === 'GET' ? 'bg-blue-100 text-blue-700' : '')}
              ${String(data.method === 'POST' ? 'bg-green-100 text-green-700' : '')}
              ${String(data.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' : '')}
              ${String(data.method === 'DELETE' ? 'bg-red-100 text-red-700' : '')}
            `}>
              {String(data.method)}
            </span>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  )
})

ActionNode.displayName = 'ActionNode'