'use client'

import React from 'react'

interface AgentPerformanceProps {
  agents: {
    id: string
    name: string
    avatar?: string
    conversions: number
    interactions: number
    conversionRate: number
    satisfaction: number
  }[]
  className?: string
}

export function AgentPerformance({ agents, className = '' }: AgentPerformanceProps) {
  return (
    <div className={`agent-performance ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Performance dos Agentes</h3>
      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {agent.avatar ? (
                <img src={agent.avatar} alt={agent.name} className="w-full h-full rounded-full" />
              ) : (
                <span className="text-sm font-medium">{agent.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{agent.name}</h4>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Conversões: {agent.conversions}</span>
                <span>Taxa: {agent.conversionRate}%</span>
                <span>Satisfação: {agent.satisfaction}/5</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
