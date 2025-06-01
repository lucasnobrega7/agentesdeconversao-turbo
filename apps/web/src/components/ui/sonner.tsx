"use client"

import { Toaster as Sonner } from "sonner"

interface ToasterProps {
  expand?: boolean
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
  richColors?: boolean
  duration?: number
}

export function Toaster({ 
  expand = false,
  position = "bottom-right",
  richColors = true,
  duration = 4000,
  ...props 
}: ToasterProps) {
  return (
    <Sonner
      expand={expand}
      position={position}
      richColors={richColors}
      duration={duration}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}