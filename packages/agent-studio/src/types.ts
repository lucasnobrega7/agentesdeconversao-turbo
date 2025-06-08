import { Node, Edge } from '@xyflow/react'

export interface NodeData {
  label: string
  description?: string
  config?: Record<string, any>
  [key: string]: unknown
}

export type FlowNode = Node<NodeData>
export type FlowEdge = Edge

export interface FlowConfig {
  id: string
  name: string
  description?: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  metadata?: {
    createdAt: string
    updatedAt: string
    version: string
  }
}

export interface SimulationResult {
  nodeId: string
  status: 'pending' | 'running' | 'success' | 'error'
  output?: any
  error?: string
  duration?: number
}

export interface NodeType {
  type: string
  label: string
  description: string
  icon: React.ComponentType<any>
  defaultData: NodeData
}
