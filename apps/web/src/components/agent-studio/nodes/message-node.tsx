"use client"

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { MessageSquare, Type } from 'lucide-react'

export const MessageNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold">{String(data.label) || 'Mensagem'}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Type className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Tipo:</span>
          <span className="font-medium">{String(data.messageType) || 'Texto'}</span>
        </div>
        
        {String(data.content) && (
          <div className="mt-2 p-2 bg-muted rounded">
            <p className="text-sm line-clamp-3">{String(data.content)}</p>
          </div>
        )}
        
        {Array.isArray(data.variables) && data.variables.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.variables.map((variable: string, index: number) => (
              <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                {variable}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  )
})

MessageNode.displayName = 'MessageNode'