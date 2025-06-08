'use client'

import { motion as Motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface AnimatedBackgroundProps {
  children: React.ReactNode
  className?: string
  variant?: 'gradient' | 'mesh' | 'dots' | 'grid'
  colors?: string[]
}

export function AnimatedBackground({
  children,
  className,
  variant = 'gradient',
  colors = ['#ff0080', '#7928ca', '#0070f3']
}: AnimatedBackgroundProps) {
  
  const renderBackground = () => {
    switch (variant) {
      case 'gradient':
        return (
          <Motion.div
            className="absolute inset-0"
            animate={{
              background: [
                `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`,
                `linear-gradient(45deg, ${colors[1]}, ${colors[2]})`,
                `linear-gradient(45deg, ${colors[2]}, ${colors[0]})`,
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        )
      
      case 'mesh':
        return (
          <div className="absolute inset-0">
            <Motion.div
              className="absolute h-full w-full opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, ${colors[0]} 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${colors[1]} 0%, transparent 50%)`
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>
        )
      
      case 'dots':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <Motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: colors[i % colors.length]
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 1, 0.2]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )
      
      case 'grid':
        return (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(${colors[0]} 1px, transparent 1px), linear-gradient(90deg, ${colors[0]} 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {renderBackground()}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
