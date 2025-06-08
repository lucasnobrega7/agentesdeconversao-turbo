'use client'

import { motion as Motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface InfiniteSliderProps {
  children: React.ReactNode[]
  className?: string
  duration?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
}

export function InfiniteSlider({
  children,
  className,
  duration = 20,
  direction = 'left',
  pauseOnHover = true
}: InfiniteSliderProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <Motion.div
        className="flex"
        animate={{
          x: direction === 'left' ? ['0%', '-100%'] : ['-100%', '0%']
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration,
            ease: 'linear'
          }
        }}
        whileHover={pauseOnHover ? { animationPlayState: 'paused' } : undefined}
      >
        {/* Original items */}
        <div className="flex shrink-0">
          {children}
        </div>
        {/* Duplicated items for seamless loop */}
        <div className="flex shrink-0">
          {children}
        </div>
      </Motion.div>
    </div>
  )
}
