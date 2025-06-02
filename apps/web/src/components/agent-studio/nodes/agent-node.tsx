"use client"

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { Bot, Settings } from 'lucide-react'

export const AgentNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">{String(data.label) || 'Agente'}</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Modelo:</span>
          <span className="font-medium">{String(data.model) || 'GPT-4'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Temperatura:</span>
          <span className="font-medium">{String(data.temperature) || 0.7}</span>
        </div>
        
        {String(data.systemPrompt) && (
          <div className="mt-2 p-2 bg-muted rounded text-xs">
            <p className="line-clamp-2">{String(data.systemPrompt)}</p>
          </div>
        )}
      </div>
      
      <button className="absolute top-2 right-2 p-1 hover:bg-muted rounded">
        <Settings className="h-3 w-3" />
      </button>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  )
})

AgentNode.displayName = 'AgentNode'