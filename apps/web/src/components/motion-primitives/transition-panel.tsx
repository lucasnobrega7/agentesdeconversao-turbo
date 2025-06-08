'use client'

import { motion as Motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface TransitionPanelProps {
  activeKey: string
  children: React.ReactNode
  className?: string
  transition?: 'fade' | 'slide' | 'scale'
  direction?: 'horizontal' | 'vertical'
}

export function TransitionPanel({
  activeKey,
  children,
  className,
  transition = 'fade',
  direction = 'horizontal'
}: TransitionPanelProps) {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: direction === 'horizontal' 
        ? { opacity: 0, x: 20 }
        : { opacity: 0, y: 20 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: direction === 'horizontal'
        ? { opacity: 0, x: -20 }
        : { opacity: 0, y: -20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    }
  }

  return (
    <AnimatePresence mode="wait">
      <Motion.div
        key={activeKey}
        className={cn(className)}
        initial={variants[transition].initial}
        animate={variants[transition].animate}
        exit={variants[transition].exit}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
      >
        {children}
      </Motion.div>
    </AnimatePresence>
  )
}
