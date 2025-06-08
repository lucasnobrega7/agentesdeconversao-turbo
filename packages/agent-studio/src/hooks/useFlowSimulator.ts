'use client'

import { useState, useCallback } from 'react'
import { FlowNode, FlowEdge, SimulationResult } from '../types'

interface Message {
  sender: 'user' | 'bot'
  content: string
  nodeId?: string
}

export function useFlowSimulator(flow?: any) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [results, setResults] = useState<SimulationResult[]>([])
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const startSimulation = useCallback(async () => {
    if (!flow || !flow.nodes) {
      console.error('No flow provided')
      return
    }

    setIsRunning(true)
    setResults([])
    setMessages([{
      sender: 'bot',
      content: 'Simulação iniciada! Como posso ajudá-lo?',
      nodeId: flow.nodes[0]?.id
    }])
    
    const startNode = flow.nodes[0]?.id
    if (startNode) {
      setCurrentNodeId(startNode)
    }
    
    setIsRunning(false)
  }, [flow])

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return

    setMessages(prev => [...prev, {
      sender: 'user',
      content,
      nodeId: currentNodeId || undefined
    }])

    setIsRunning(true)
    
    // Simulate processing
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'bot',
        content: `Recebi sua mensagem: "${content}". Processando...`,
        nodeId: currentNodeId || undefined
      }])
      setIsRunning(false)
    }, 1500)
  }, [currentNodeId])

  const simulateFlow = useCallback(async (
    nodes: FlowNode[],
    edges: FlowEdge[],
    startNodeId?: string
  ) => {
    setIsSimulating(true)
    setResults([])
    
    const startNode = startNodeId || nodes.find(n => n.type === 'message')?.id
    if (!startNode) {
      console.error('No start node found')
      setIsSimulating(false)
      return
    }

    // Simple simulation logic
    let currentNode: string | null = startNode
    const visited = new Set<string>()

    while (currentNode && !visited.has(currentNode)) {
      visited.add(currentNode)
      setCurrentNodeId(currentNode)

      // Simulate node execution
      const result: SimulationResult = {
        nodeId: currentNode,
        status: 'running'
      }
      
      setResults(prev => [...prev, result])
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update result
      setResults(prev => prev.map(r => 
        r.nodeId === currentNode 
          ? { ...r, status: 'success', duration: 1000 }
          : r
      ))

      // Find next node
      const outgoingEdge = edges.find(e => e.source === currentNode)
      currentNode = outgoingEdge?.target || null
    }

    setIsSimulating(false)
    setCurrentNodeId(null)
  }, [])

  const resetSimulation = useCallback(() => {
    setResults([])
    setCurrentNodeId(null)
    setIsSimulating(false)
    setMessages([])
    setIsRunning(false)
  }, [])

  const reset = resetSimulation

  return {
    simulateFlow,
    resetSimulation,
    isSimulating,
    results,
    currentNodeId,
    messages,
    isRunning,
    startSimulation,
    sendMessage,
    reset
  }
}
