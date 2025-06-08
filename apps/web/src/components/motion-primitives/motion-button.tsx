"use client"

import { motion } from "motion/react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface MotionButtonProps extends ButtonProps {
  children: React.ReactNode
  pressAnimation?: boolean
  hoverAnimation?: boolean
  glowEffect?: boolean
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, className, pressAnimation = true, hoverAnimation = true, glowEffect = false, ...props }, ref) => {
    const motionProps = {
      whileHover: hoverAnimation ? { scale: 1.05, y: -2 } : undefined,
      whileTap: pressAnimation ? { scale: 0.95 } : undefined,
      transition: { duration: 0.2, ease: "easeOut" }
    }

    if (glowEffect) {
      return (
        <motion.div 
          {...motionProps}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-primary/20 blur-md rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
          <Button 
            ref={ref}
            className={cn("relative group", className)} 
            {...props}
          >
            {children}
          </Button>
        </motion.div>
      )
    }

    return (
      <motion.div {...motionProps}>
        <Button 
          ref={ref}
          className={className} 
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    )
  }
)

MotionButton.displayName = "MotionButton"