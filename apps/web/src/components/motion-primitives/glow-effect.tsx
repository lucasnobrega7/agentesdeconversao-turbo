'use client'

import { motion as Motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface GlowEffectProps {
  children: React.ReactNode
  className?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  intensity?: number
}

export function GlowEffect({
  children,
  className,
  color = '#0ea5e9',
  size = 'md',
  intensity = 0.5
}: GlowEffectProps) {
  const sizeMap = {
    sm: '100px',
    md: '200px',
    lg: '300px'
  }

  return (
    <div className={cn('relative', className)}>
      <Motion.div
        className="absolute inset-0 -z-10"
        animate={{
          opacity: [intensity * 0.5, intensity, intensity * 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: sizeMap[size],
            height: sizeMap[size],
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            filter: 'blur(40px)'
          }}
        />
      </Motion.div>
      {children}
    </div>
  )
}
