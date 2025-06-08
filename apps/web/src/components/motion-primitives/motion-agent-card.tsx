"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bot, MoreVertical, Activity, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"
import { motion } from "motion/react"
import { GlowEffect } from "./glow-effect"
import { AnimatedBackground } from "./animated-background"

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

export function MotionAgentCard({ agent, onEdit, onDelete, onDuplicate }: AgentCardProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      <GlowEffect>
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
          <AnimatedBackground className="absolute inset-0 opacity-0 group-hover:opacity-10" />
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Bot className="h-5 w-5 text-primary" />
                  </motion.div>
                  {agent.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {agent.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge 
                    variant="secondary" 
                    className={`${statusColors[agent.status]} text-white border-0`}
                  >
                    {statusLabels[agent.status]}
                  </Badge>
                </motion.div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </motion.div>
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
              <motion.div 
                className="space-y-1"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Conversas
                </p>
                <p className="font-semibold text-lg">{agent.conversations}</p>
              </motion.div>
              <motion.div 
                className="space-y-1"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Taxa de Conversão
                </p>
                <p className="font-semibold text-lg">{agent.conversionRate}%</p>
              </motion.div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {agent.lastActive}
              </span>
              {agent.model && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant="outline" className="text-xs">
                    {agent.model}
                  </Badge>
                </motion.div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex gap-2">
            <Link href={`/agents/${agent.id}/test`} className="flex-1">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Testar
                </Button>
              </motion.div>
            </Link>
            <Link href={`/agent-studio/${agent.id}/flow`} className="flex-1">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button size="sm" className="w-full">
                  Editar Fluxo
                </Button>
              </motion.div>
            </Link>
          </CardFooter>
        </Card>
      </GlowEffect>
    </motion.div>
  )
}