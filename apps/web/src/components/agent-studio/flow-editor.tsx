"use client"

import React, { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStudioStore } from '@/stores/studio-store'

// Custom node types
import { AgentNode } from './nodes/agent-node'
import { MessageNode } from './nodes/message-node'
import { ActionNode } from './nodes/action-node'

const nodeTypes = {
  agent: AgentNode,
  message: MessageNode,
  action: ActionNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Início' },
    position: { x: 250, y: 5 },
  },
]

const initialEdges: Edge[] = []

export function FlowEditor() {
  const { nodes, edges, setNodes, setEdges, addHistorySnapshot, addNode } = useStudioStore()
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes.length ? nodes : initialNodes)
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges.length ? edges : initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, localEdges)
      setLocalEdges(newEdges)
      setEdges(newEdges)
      addHistorySnapshot()
    },
    [localEdges, setLocalEdges, setEdges, addHistorySnapshot]
  )

  const onNodeDragStop = useCallback(() => {
    setNodes(localNodes)
    addHistorySnapshot()
  }, [localNodes, setNodes, addHistorySnapshot])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type || !reactFlowInstance) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          ...(type === 'agent' && { model: 'GPT-4', temperature: 0.7 }),
          ...(type === 'message' && { messageType: 'Texto', content: '' }),
          ...(type === 'action' && { actionType: 'api', method: 'GET' }),
        },
      }

      setLocalNodes((nds) => nds.concat(newNode))
      addNode(newNode)
    },
    [reactFlowInstance, setLocalNodes, addNode]
  )

  return (
    <div className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2 }
        }}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}