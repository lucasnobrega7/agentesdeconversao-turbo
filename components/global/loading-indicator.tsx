import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingIndicatorProps {
  text?: string
  className?: string
  iconClassName?: string
  textClassName?: string
  fullScreen?: boolean
}

export function LoadingIndicator({
  text = "Carregando detalhes...",
  className,
  iconClassName,
  textClassName,
  fullScreen = false,
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2",
        fullScreen && "fixed inset-0 bg-background/80 z-50",
        className,
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className={cn("h-8 w-8 animate-spin text-primary", iconClassName)} />
      <p className={cn("text-sm text-muted-foreground", textClassName)}>{text}</p>
    </div>
  )
}
