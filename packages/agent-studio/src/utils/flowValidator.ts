import { FlowNode, FlowEdge } from '../types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateFlow(
  nodes: FlowNode[],
  edges: FlowEdge[]
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if there are any nodes
  if (nodes.length === 0) {
    errors.push('O fluxo deve ter pelo menos um nó')
  }

  // Check for start node
  const startNodes = nodes.filter(n => 
    !edges.some(e => e.target === n.id)
  )
  
  if (startNodes.length === 0) {
    errors.push('O fluxo deve ter um nó inicial')
  } else if (startNodes.length > 1) {
    warnings.push('O fluxo tem múltiplos nós iniciais')
  }

  // Check for orphaned nodes
  const orphanedNodes = nodes.filter(n => 
    !edges.some(e => e.source === n.id || e.target === n.id)
  )
  
  if (orphanedNodes.length > 0) {
    warnings.push(`${orphanedNodes.length} nó(s) não conectado(s)`)
  }

  // Check for circular dependencies
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  
  function hasCircularDependency(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)
    
    const outgoingEdges = edges.filter(e => e.source === nodeId)
    
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (hasCircularDependency(edge.target)) {
          return true
        }
      } else if (recursionStack.has(edge.target)) {
        return true
      }
    }
    
    recursionStack.delete(nodeId)
    return false
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCircularDependency(node.id)) {
        errors.push('O fluxo contém dependências circulares')
        break
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
