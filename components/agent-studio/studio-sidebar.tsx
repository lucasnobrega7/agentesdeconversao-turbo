"use client"

import React from "react"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { nodeCategories } from "./nodes"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export function StudioSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-3 border-b relative">
        <Icons.Search className="absolute left-5.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
        <Input
          placeholder="Buscar componentes..."
          className="pl-8 h-9 text-xs"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {nodeCategories.map((category, catIndex) => (
            <div key={category.label}>
              <div className="flex items-center space-x-2 mb-2 px-1">
                {category.icon && (() => {
                  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>
                  return <IconComponent className="h-4 w-4 text-muted-foreground" />
                })()}
                <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">{category.label}</h3>
              </div>
              <div className="space-y-1.5">
                {category.nodes.map((node) => {
                  const IconComponent = (node.icon ? Icons[node.icon as keyof typeof Icons] : Icons.BoxSelect) as React.ComponentType<{ className?: string }>
                  return (
                    <div
                      key={node.type}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border bg-background cursor-grab hover:bg-accent hover:shadow-md transition-all duration-150 ease-in-out active:cursor-grabbing active:shadow-lg",
                      )}
                      draggable
                      onDragStart={(e) => onDragStart(e, node.type)}
                    >
                      <IconComponent className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">{node.label}</span>
                    </div>
                  )
                })}
              </div>
              {catIndex < nodeCategories.length - 1 && <Separator className="my-3" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
