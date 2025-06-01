'use client'

import React, { useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  ReactFlowInstance,
  ConnectionMode,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'

import { NodePanel } from './NodePanel'
import { PropertiesPanel } from './PropertiesPanel'
import { SimulatorPanel } from './SimulatorPanel'
import { useFlowStore } from '../store/flowStore'
import { nodeTypes } from '../nodes'
import { FlowToolbar } from './FlowToolbar'

interface AgentStudioProps {
  flowId?: string
  onSave?: (flow: any) => void
  readonly?: boolean
}

const defaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 2,
    stroke: '#0ea5e9'
  }
}

function AgentStudioFlow({ flowId, onSave, readonly = false }: AgentStudioProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null)
  
  const {
    nodes,
    edges,
    selectedNode,
    setNodes,
    setEdges,
    setSelectedNode,
    addNode,
    updateNode,
    deleteNode
  } = useFlowStore()

  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes)
  const [edgesState, setEdgesState, onEdgesChange] = useEdgesState(edges)
  const [showSimulator, setShowSimulator] = React.useState(false)

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdgesState((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds))
    },
    [setEdgesState]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
  }, [setSelectedNode])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowWrapper.current || !reactFlowInstance) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      if (!type) return

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      }

      setNodesState((nds) => nds.concat(newNode))
      addNode(newNode)
    },
    [reactFlowInstance, setNodesState, addNode]
  )

  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance)
  }

  return (
    <div className="h-full w-full flex">
      {/* Left Panel - Node Library */}
      <div className="w-64 bg-gray-50 border-r border-gray-200">
        <NodePanel />
      </div>

      {/* Center - Flow Editor */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodesState}
          edges={edgesState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={12} 
            size={1} 
            color="#e5e7eb"
          />
          <Controls />
          <MiniMap 
            nodeStrokeColor="#0ea5e9"
            nodeColor="#f3f4f6"
            nodeBorderRadius={8}
          />
          <Panel position="top-center">
            <FlowToolbar 
              onSave={() => onSave?.({ nodes: nodesState, edges: edgesState })}
              onSimulate={() => setShowSimulator(!showSimulator)}
              readonly={readonly}
            />
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 bg-white border-l border-gray-200">
        {selectedNode ? (
          <PropertiesPanel 
            nodeId={selectedNode} 
            onUpdate={(data) => updateNode(selectedNode, data)}
          />
        ) : (
          <div className="p-4 text-gray-500 text-center">
            Selecione um nó para editar suas propriedades
          </div>
        )}
      </div>

      {/* Simulator Overlay */}
      {showSimulator && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <SimulatorPanel 
            flow={{ nodes: nodesState, edges: edgesState }}
            onClose={() => setShowSimulator(false)}
          />
        </div>
      )}
    </div>
  )
}

export function AgentStudio(props: AgentStudioProps) {
  return (
    <ReactFlowProvider>
      <AgentStudioFlow {...props} />
    </ReactFlowProvider>
  )
}
