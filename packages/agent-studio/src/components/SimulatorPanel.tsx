'use client'

import React, { useState } from 'react'
import { X, Play, RotateCcw, Send } from 'lucide-react'
import { useFlowSimulator } from '../hooks/useFlowSimulator'

interface SimulatorPanelProps {
  flow: any
  onClose: () => void
}

export function SimulatorPanel({ flow, onClose }: SimulatorPanelProps) {
  const [input, setInput] = useState('')
  const { 
    messages, 
    isRunning, 
    currentNodeId,
    startSimulation,
    sendMessage,
    reset
  } = useFlowSimulator(flow)

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Simulador de Fluxo
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={reset}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Resetar"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="mb-4">Clique em "Iniciar Simulação" para testar seu fluxo</p>
                <button
                  onClick={startSimulation}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 mx-auto"
                >
                  <Play size={16} />
                  <span>Iniciar Simulação</span>
                </button>
              </div>
            ) : (
              messages.map((message: any, index: number) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.nodeId && (
                      <p className="text-xs mt-1 opacity-70">
                        Node: {message.nodeId}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isRunning && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                    <span className="text-sm">Processando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Digite uma mensagem..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!messages.length || isRunning}
              />
              <button
                onClick={handleSend}
                disabled={!messages.length || isRunning || !input.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Flow Visualization */}
        <div className="w-80 border-l border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-4">Execução do Fluxo</h4>
          
          <div className="space-y-2">
            {flow.nodes.map((node: any) => (
              <div
                key={node.id}
                className={`p-3 rounded-lg border ${
                  currentNodeId === node.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{node.data.label}</span>
                  {currentNodeId === node.id && (
                    <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                <span className="text-xs text-gray-500">{node.type}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600">
              💡 O simulador executa o fluxo em tempo real, mostrando qual nó está sendo processado
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
