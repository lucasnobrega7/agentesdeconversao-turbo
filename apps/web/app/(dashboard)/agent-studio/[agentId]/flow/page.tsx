"use client"

import { ReactFlowProvider } from "@xyflow/react"
import { FlowEditor } from "@/components/agent-studio/flow-editor"
import { StudioSidebar } from "@/components/agent-studio/studio-sidebar"
import { PropertiesPanel } from "@/components/agent-studio/properties-panel"
import { StudioToolbar } from "@/components/agent-studio/studio-toolbar"
import { useStudioStore } from "@/stores/studio-store"
import { useEffect } from "react"

export default function AgentStudioFlowPage({ params }: { params: { agentId: string } }) {
  const { selectedNodeId, nodes, loadInitialFlow } = useStudioStore((state) => ({
    selectedNodeId: state.selectedNodeId,
    nodes: state.nodes,
    loadInitialFlow: state.loadInitialFlow, // Assuming you add this to your store
  }))

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  // Placeholder: Load flow data when component mounts or agentId changes
  // In a real app, you'd fetch this from your backend
  useEffect(() => {
    console.log(`Carregando fluxo para o agente: ${params.agentId}`)
    // Example: loadInitialFlow(fetchedNodes, fetchedEdges);
    // For now, the store initializes with an empty flow or initialNodes from FlowEditor
  }, [params.agentId])

  return (
    // Ensure ReactFlowProvider wraps only components that need its context
    // and not the entire page if toolbar/sidebar don't directly use useReactFlow() hooks.
    // However, if they might in the future (e.g. toolbar actions interacting with viewport),
    // keeping it at this level is fine.
    <ReactFlowProvider>
      <div className="flex h-[calc(100vh-var(--header-height,4rem))] w-full flex-col bg-muted/20">
        <StudioToolbar agentId={params.agentId} flowName={`Fluxo do Agente ${params.agentId.substring(0, 6)}...`} />
        <div className="flex flex-1 overflow-hidden">
          <StudioSidebar />
          <div className="flex-1 relative h-full">
            <FlowEditor />
          </div>
          {selectedNode && <PropertiesPanel node={selectedNode} />}
        </div>
      </div>
    </ReactFlowProvider>
  )
}
