import React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"

export interface CustomNodeData {
  label: string
  icon?: keyof typeof Icons
  description?: string
  status?: "default" | "running" | "error" | "completed"
  color?: string // For "Voice Signature" like accents
  [key: string]: any
}

interface NodeWrapperProps {
  data: CustomNodeData
  selected?: boolean
  title: string
  iconName?: keyof typeof Icons
  children?: React.ReactNode
  hasInputHandle?: boolean
  hasOutputHandle?: boolean
  inputHandleId?: string
  outputHandleId?: string
  footerContent?: React.ReactNode
}

export const NodeWrapper: React.FC<NodeWrapperProps> = ({
  data,
  selected,
  title,
  iconName,
  children,
  hasInputHandle = true,
  hasOutputHandle = true,
  inputHandleId = "a",
  outputHandleId = "b",
  footerContent,
}) => {
  const IconComponent = iconName ? Icons[iconName] as React.ComponentType<{ className?: string }> : null
  const statusColor =
    data.status === "running"
      ? "border-blue-500"
      : data.status === "error"
        ? "border-red-500"
        : data.status === "completed"
          ? "border-green-500"
          : "border-border"

  const accentStyle = data.color ? { borderLeftColor: data.color, borderLeftWidth: "4px" } : {}

  return (
    <Card
      className={cn(
        "min-w-[220px] max-w-[320px] shadow-lg transition-all duration-150 ease-in-out rounded-lg overflow-hidden",
        statusColor,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-2xl",
      )}
      style={accentStyle}
    >
      {hasInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          id={inputHandleId}
          className="!h-full !w-3 !rounded-none !border-none !bg-transparent hover:!bg-primary/20 transition-colors"
          style={{ left: "-6px" }}
        />
      )}
      <CardHeader className="flex flex-row items-center space-x-2 p-3 bg-muted/30">
        {IconComponent && (
          <IconComponent className={cn("h-5 w-5", data.color ? `text-[${data.color}]` : "text-primary")} />
        )}
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold">{data.label || title}</CardTitle>
          {data.description && <CardDescription className="text-xs">{data.description}</CardDescription>}
        </div>
      </CardHeader>
      {children && <CardContent className="p-3 text-xs">{children}</CardContent>}
      {footerContent && <CardFooter className="p-3 text-xs bg-muted/20">{footerContent}</CardFooter>}
      {hasOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          id={outputHandleId}
          className="!h-full !w-3 !rounded-none !border-none !bg-transparent hover:!bg-primary/20 transition-colors"
          style={{ right: "-6px" }}
        />
      )}
    </Card>
  )
}
