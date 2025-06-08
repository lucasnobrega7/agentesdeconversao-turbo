'use client'

import { motion as Motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface InViewProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
  initial?: any
  whileInView?: any
  viewport?: any
  transition?: any
}

export function InView({
  children,
  className,
  animate = true,
  initial = { opacity: 0, y: 20 },
  whileInView = { opacity: 1, y: 0 },
  viewport = { once: true, margin: '-100px' },
  transition = { duration: 0.5, ease: 'easeOut' },
  ...props
}: InViewProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, viewport)

  if (!animate) {
    return <div className={className}>{children}</div>
  }

  return (
    <Motion.div
      ref={ref}
      className={cn(className)}
      initial={initial}
      animate={isInView ? whileInView : initial}
      transition={transition}
      {...props}
    >
      {children}
    </Motion.div>
  )
}
