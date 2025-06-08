'use client'

import { motion as Motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface AnimatedGroupProps {
  children: React.ReactNode[]
  className?: string
  preset?: 'fade' | 'slide' | 'scale' | 'blur'
  stagger?: number
  duration?: number
}

export function AnimatedGroup({
  children,
  className,
  preset = 'fade',
  stagger = 0.1,
  duration = 0.5
}: AnimatedGroupProps) {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    slide: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 }
    },
    blur: {
      initial: { opacity: 0, filter: 'blur(10px)' },
      animate: { opacity: 1, filter: 'blur(0px)' }
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {children.map((child, index) => (
        <Motion.div
          key={index}
          initial={variants[preset].initial}
          animate={variants[preset].animate}
          transition={{
            duration,
            delay: index * stagger,
            ease: 'easeOut'
          }}
        >
          {child}
        </Motion.div>
      ))}
    </div>
  )
}
