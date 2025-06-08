'use client'

import { motion as Motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface ProgressiveBlurProps {
  children: React.ReactNode
  className?: string
  maxBlur?: number
}

export function ProgressiveBlur({
  children,
  className,
  maxBlur = 10
}: ProgressiveBlurProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  })

  const blur = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, maxBlur / 2, maxBlur]
  )

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.5, 0.2]
  )

  return (
    <Motion.div
      ref={ref}
      className={cn(className)}
      style={{
        filter: useTransform(blur, (value) => `blur(${value}px)`),
        opacity
      }}
    >
      {children}
    </Motion.div>
  )
}
