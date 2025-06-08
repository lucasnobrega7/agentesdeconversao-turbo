'use client'

import { motion as Motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TextMorphProps {
  texts: string[]
  className?: string
  interval?: number
  morphDuration?: number
}

export function TextMorph({
  texts,
  className,
  interval = 3000,
  morphDuration = 0.5
}: TextMorphProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [texts.length, interval])

  return (
    <div className={cn('relative inline-block', className)}>
      <AnimatePresence mode="wait">
        <Motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
          transition={{
            duration: morphDuration,
            ease: 'easeInOut'
          }}
          className="inline-block"
        >
          {texts[currentIndex]}
        </Motion.span>
      </AnimatePresence>
    </div>
  )
}
