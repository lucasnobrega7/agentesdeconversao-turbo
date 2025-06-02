"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bot, MoreVertical, Activity, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"

interface AgentCardProps {
  agent: {
    id: string
    name: string
    description: string
    status: 'active' | 'inactive' | 'training'
    conversations: number
    conversionRate: number
    lastActive: string
    model?: string
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
}

export function AgentCard({ agent, onEdit, onDelete, onDuplicate }: AgentCardProps) {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    training: 'bg-yellow-500'
  }

  const statusLabels = {
    active: 'Ativo',
    inactive: 'Inativo',
    training: 'Treinando'
  }

  return (
    <Card className="group relative hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              {agent.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {agent.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${statusColors[agent.status]} text-white border-0`}
            >
              {statusLabels[agent.status]}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(agent.id)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(agent.id)}>
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete?.(agent.id)}
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Conversas
            </p>
            <p className="font-semibold text-lg">{agent.conversations}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Taxa de Conversão
            </p>
            <p className="font-semibold text-lg">{agent.conversionRate}%</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {agent.lastActive}
          </span>
          {agent.model && (
            <Badge variant="outline" className="text-xs">
              {agent.model}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/agents/${agent.id}/test`}>
            Testar
          </Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/agent-studio/${agent.id}/flow`}>
            Editar Fluxo
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}