'use client'

import { useMemo } from 'react'
import { MessageSquare, GitBranch, Cloud, FileText, Plug } from 'lucide-react'
import { NodeType } from '../types'

export function useNodeTypes(): NodeType[] {
  return useMemo(() => [
    {
      type: 'message',
      label: 'Mensagem',
      description: 'Enviar mensagem para o usuário',
      icon: MessageSquare,
      defaultData: {
        label: 'Nova Mensagem',
        description: 'Configurar mensagem'
      }
    },
    {
      type: 'condition',
      label: 'Condição',
      description: 'Adicionar lógica condicional',
      icon: GitBranch,
      defaultData: {
        label: 'Nova Condição',
        description: 'Configurar condição'
      }
    },
    {
      type: 'api',
      label: 'API',
      description: 'Chamar endpoint externo',
      icon: Cloud,
      defaultData: {
        label: 'Nova API',
        description: 'Configurar chamada'
      }
    },
    {
      type: 'prompt',
      label: 'Prompt',
      description: 'Prompt para IA',
      icon: FileText,
      defaultData: {
        label: 'Novo Prompt',
        description: 'Configurar prompt'
      }
    },
    {
      type: 'integration',
      label: 'Integração',
      description: 'Conectar com serviços',
      icon: Plug,
      defaultData: {
        label: 'Nova Integração',
        description: 'Configurar integração'
      }
    }
  ], [])
}
