'use client'

import { motion as Motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface TextShimmerProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
}

export function TextShimmer({
  children,
  className,
  duration = 2,
  delay = 0
}: TextShimmerProps) {
  return (
    <span className={cn('relative inline-block', className)}>
      <span className="relative z-10">{children}</span>
      <Motion.span
        className="absolute inset-0 -z-10"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration,
          delay,
          ease: 'linear'
        }}
      >
        <span
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            transform: 'skewX(-20deg)'
          }}
        />
      </Motion.span>
    </span>
  )
}
