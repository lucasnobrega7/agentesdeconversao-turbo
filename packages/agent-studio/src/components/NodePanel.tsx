'use client'

import React from 'react'
import { 
  MessageSquare, 
  GitBranch, 
  Globe, 
  FileText, 
  Plug,
  Bot,
  Zap,
  Database,
  Timer,
  Filter
} from 'lucide-react'

const nodeCategories = [
  {
    name: 'Básicos',
    nodes: [
      { 
        type: 'message', 
        label: 'Mensagem', 
        icon: MessageSquare,
        color: 'bg-blue-500',
        description: 'Enviar mensagem ao usuário'
      },
      { 
        type: 'prompt', 
        label: 'Prompt IA', 
        icon: Bot,
        color: 'bg-purple-500',
        description: 'Processar com IA'
      },
      { 
        type: 'condition', 
        label: 'Condição', 
        icon: GitBranch,
        color: 'bg-yellow-500',
        description: 'Lógica condicional'
      }
    ]
  },
  {
    name: 'Integrações',
    nodes: [
      { 
        type: 'api', 
        label: 'API Call', 
        icon: Globe,
        color: 'bg-green-500',
        description: 'Chamar API externa'
      },
      { 
        type: 'integration', 
        label: 'Integração', 
        icon: Plug,
        color: 'bg-indigo-500',
        description: 'WhatsApp, Instagram, etc'
      },
      { 
        type: 'database', 
        label: 'Database', 
        icon: Database,
        color: 'bg-gray-600',
        description: 'Consultar banco de dados'
      }
    ]
  },
  {
    name: 'Controle',
    nodes: [
      { 
        type: 'delay', 
        label: 'Delay', 
        icon: Timer,
        color: 'bg-orange-500',
        description: 'Aguardar tempo'
      },
      { 
        type: 'filter', 
        label: 'Filtro', 
        icon: Filter,
        color: 'bg-pink-500',
        description: 'Filtrar dados'
      },
      { 
        type: 'function', 
        label: 'Função', 
        icon: Zap,
        color: 'bg-red-500',
        description: 'Código customizado'
      }
    ]
  }
]

export function NodePanel() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="h-full p-4 overflow-y-auto">
      <h3 className="font-semibold text-gray-900 mb-4">Componentes</h3>
      
      {nodeCategories.map((category) => (
        <div key={category.name} className="mb-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            {category.name}
          </h4>
          <div className="space-y-2">
            {category.nodes.map((node) => {
              const Icon = node.icon
              return (
                <div
                  key={node.type}
                  className="group relative bg-white rounded-lg border border-gray-200 p-3 cursor-move hover:shadow-md transition-all duration-200 hover:border-blue-300"
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${node.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {node.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {node.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Drag hint */}
                  <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-opacity-0 group-hover:ring-opacity-20 pointer-events-none transition-all" />
                </div>
              )
            })}
          </div>
        </div>
      ))}
      
      <div className="mt-6 p-3 bg-gray-100 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 Arraste os componentes para o canvas para criar seu fluxo
        </p>
      </div>
    </div>
  )
}
