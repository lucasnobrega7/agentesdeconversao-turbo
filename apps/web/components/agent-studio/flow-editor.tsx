"use client"

import type React from "react"

import { useCallback, useRef } from "react"
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
  MiniMap,
  type Node,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { nodeTypes } from "./nodes"
import { useStudioStore } from "@/stores/studio-store"

const initialNodes: Node[] = [
  {
    id: "1",
    type: "startNode",
    data: { label: "Início" },
    position: { x: 250, y: 50 },
  },
]

export function FlowEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId } = useStudioStore(
    (state) => ({
      nodes: state.nodes.length > 0 ? state.nodes : initialNodes, // Use initialNodes if store is empty
      edges: state.edges,
      onNodesChange: (changes: NodeChange[]) =>
        state.setNodes(applyNodeChanges(changes, state.nodes.length > 0 ? state.nodes : initialNodes)),
      onEdgesChange: (changes: EdgeChange[]) => state.setEdges(applyEdgeChanges(changes, state.edges)),
      onConnect: (params: Connection) => state.setEdges(addEdge(params, state.edges)),
      addNode: state.addNode,
      setSelectedNodeId: state.setSelectedNodeId,
    }),
  )

  const { project } = useReactFlow()

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      if (!reactFlowWrapper.current) return

      const type = event.dataTransfer.getData("application/reactflow")
      if (typeof type === "undefined" || !type) {
        return
      }

      const position = project({
        x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
        y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
      })

      const newNode: Node = {
        id: `node_${+new Date()}`, // Ensure unique ID
        type,
        position,
        data: { label: `${type.replace("Node", "")}` }, // Basic label
      }
      addNode(newNode)
    },
    [project, addNode],
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id)
    },
    [setSelectedNodeId],
  )

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background" // Ensure this class is applied
      >
        <Controls className="!border-border !bg-card !shadow-lg" />
        <MiniMap nodeStrokeWidth={3} zoomable pannable className="!border-border !bg-card" />
        <Background
          variant="dots"
          gap={16}
          size={1}
          className="!bg-muted/30" // Adjusted from design doc for better visibility
        />
      </ReactFlow>
    </div>
  )
}
