import { create } from 'zustand'
import { Node, Edge } from 'reactflow'

interface FlowState {
  nodes: Node[]
  edges: Edge[]
  selectedNode: string | null
  
  // Actions
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  setSelectedNode: (nodeId: string | null) => void
  addNode: (node: Node) => void
  updateNode: (nodeId: string, data: any) => void
  deleteNode: (nodeId: string) => void
  addEdge: (edge: Edge) => void
  deleteEdge: (edgeId: string) => void
  clearFlow: () => void
}

export const useFlowStore = create<FlowState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  
  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    )
  })),
  
  deleteNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== nodeId),
    edges: state.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ),
    selectedNode: state.selectedNode === nodeId ? null : state.selectedNode
  })),
  
  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge]
  })),
  
  deleteEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== edgeId)
  })),
  
  clearFlow: () => set({
    nodes: [],
    edges: [],
    selectedNode: null
  })
}))
