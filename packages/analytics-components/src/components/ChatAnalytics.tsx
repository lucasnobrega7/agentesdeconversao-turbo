'use client'

import React from 'react'

interface ChatAnalyticsProps {
  data: {
    totalChats: number
    activeChats: number
    avgResponseTime: number
    avgChatDuration: number
    satisfactionRate: number
    resolutionRate: number
  }
  className?: string
}

export function ChatAnalytics({ data, className = '' }: ChatAnalyticsProps) {
  return (
    <div className={`chat-analytics ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Análise de Chats</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total de Chats</p>
          <p className="text-2xl font-bold">{data.totalChats.toLocaleString()}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Chats Ativos</p>
          <p className="text-2xl font-bold">{data.activeChats}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Tempo de Resposta</p>
          <p className="text-2xl font-bold">{data.avgResponseTime}s</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Duração Média</p>
          <p className="text-2xl font-bold">{data.avgChatDuration}min</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Satisfação</p>
          <p className="text-2xl font-bold">{data.satisfactionRate}%</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
          <p className="text-2xl font-bold">{data.resolutionRate}%</p>
        </div>
      </div>
    </div>
  )
}
