import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import type { Node, Edge, Viewport } from "@xyflow/react"
import { nanoid } from "nanoid"

export interface RFState {
  nodes: Node[]
  edges: Edge[]
  viewport: Viewport | undefined
  selectedNodeId: string | null

  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (node: Omit<Node, "id" | "position"> & { id?: string; position?: { x: number; y: number } }) => void // Allow position to be optional for programmatic add
  updateNodeData: (nodeId: string, data: any) => void
  deleteNode: (nodeId: string) => void
  setSelectedNodeId: (nodeId: string | null) => void

  // New: For loading an entire flow
  loadInitialFlow: (nodes: Node[], edges: Edge[]) => void

  history: Array<{ nodes: Node[]; edges: Edge[] }>
  historyIndex: number
  undo: () => void
  redo: () => void
  takeSnapshot: () => void
  addHistorySnapshot: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

const MAX_HISTORY_LENGTH = 50

export const useStudioStore = create<RFState>()(
  immer((set, get) => ({
    nodes: [],
    edges: [],
    viewport: undefined,
    selectedNodeId: null,

    setNodes: (nodes) => {
      set((state) => {
        state.nodes = nodes
      })
      // Avoid snapshot on direct setNodes if it's part of undo/redo or initial load
    },
    setEdges: (edges) => {
      set((state) => {
        state.edges = edges
      })
      // Avoid snapshot on direct setEdges
    },
    addNode: (node) => {
      const newNode = {
        ...node,
        id: node.id || nanoid(),
        // Default position if not provided, though onDrop usually provides it
        position: node.position || { x: Math.random() * 400, y: Math.random() * 400 },
      }
      set((state) => {
        state.nodes.push(newNode)
      })
      get().takeSnapshot()
    },
    updateNodeData: (nodeId, data) => {
      let changed = false
      set((state) => {
        const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId)
        if (nodeIndex !== -1) {
          // Check if data actually changed to avoid unnecessary snapshots
          if (
            JSON.stringify(state.nodes[nodeIndex]?.data) !== JSON.stringify({ ...state.nodes[nodeIndex]?.data, ...data })
          ) {
            state.nodes[nodeIndex]!.data = { ...state.nodes[nodeIndex]?.data, ...data }
            changed = true
          }
        }
      })
      if (changed) {
        get().takeSnapshot()
      }
    },
    deleteNode: (nodeId) => {
      set((state) => {
        state.nodes = state.nodes.filter((n) => n.id !== nodeId)
        state.edges = state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
        if (state.selectedNodeId === nodeId) {
          state.selectedNodeId = null
        }
      })
      get().takeSnapshot()
    },
    setSelectedNodeId: (nodeId) => {
      set((state) => {
        state.selectedNodeId = nodeId
      })
    },

    loadInitialFlow: (initialNodes, initialEdges) => {
      set((state) => {
        state.nodes = initialNodes
        state.edges = initialEdges
        state.selectedNodeId = null
        // Reset history for the new flow
        state.history = [{ nodes: [...initialNodes], edges: [...initialEdges] }]
        state.historyIndex = 0
      })
    },

    history: [],
    historyIndex: -1,
    takeSnapshot: () => {
      set((state) => {
        // Avoid snapshot if current state is same as last in history
        if (state.historyIndex >= 0) {
          const lastSnapshot = state.history[state.historyIndex]
          if (
            lastSnapshot &&
            JSON.stringify(lastSnapshot.nodes) === JSON.stringify(state.nodes) &&
            JSON.stringify(lastSnapshot.edges) === JSON.stringify(state.edges)
          ) {
            return
          }
        }

        const currentSnapshot = { nodes: [...state.nodes], edges: [...state.edges] }
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push(currentSnapshot)

        if (newHistory.length > MAX_HISTORY_LENGTH) {
          state.history = newHistory.slice(newHistory.length - MAX_HISTORY_LENGTH)
        } else {
          state.history = newHistory
        }
        state.historyIndex = state.history.length - 1
      })
    },
    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--
          const snapshot = state.history[state.historyIndex]
          if (snapshot) {
            state.nodes = [...snapshot.nodes]
            state.edges = [...snapshot.edges]
            state.selectedNodeId = null
          }
        }
      })
    },
    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++
          const snapshot = state.history[state.historyIndex]
          if (snapshot) {
            state.nodes = [...snapshot.nodes]
            state.edges = [...snapshot.edges]
            state.selectedNodeId = null
          }
        }
      })
    },
    addHistorySnapshot: () => {
      get().takeSnapshot()
    },
    canUndo: () => {
      return get().historyIndex > 0
    },
    canRedo: () => {
      const state = get()
      return state.historyIndex < state.history.length - 1
    },
  })),
)

// Initialize with a snapshot if store is empty
if (useStudioStore.getState().history.length === 0) {
  useStudioStore.getState().takeSnapshot()
}
