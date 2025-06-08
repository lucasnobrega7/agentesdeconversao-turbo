'use client'

import { motion as Motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CursorProps {
  className?: string
  cursorSize?: number
  cursorColor?: string
  delay?: number
}

export function Cursor({
  className,
  cursorSize = 40,
  cursorColor = 'rgba(255, 255, 255, 0.5)',
  delay = 0
}: CursorProps) {
  const [isPointer, setIsPointer] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setTimeout(() => {
        cursorX.set(e.clientX - cursorSize / 2)
        cursorY.set(e.clientY - cursorSize / 2)
      }, delay)
    }

    const updateCursorType = () => {
      const hoveredElement = document.elementFromPoint(
        cursorX.get() + cursorSize / 2,
        cursorY.get() + cursorSize / 2
      )
      
      if (hoveredElement) {
        const computedStyle = window.getComputedStyle(hoveredElement)
        const cursor = computedStyle.cursor
        setIsPointer(cursor === 'pointer')
      }
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mousemove', updateCursorType)
    window.addEventListener('scroll', updateCursorType)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mousemove', updateCursorType)
      window.removeEventListener('scroll', updateCursorType)
    }
  }, [cursorSize, cursorX, cursorY, delay])

  return (
    <Motion.div
      className={cn(
        'pointer-events-none fixed left-0 top-0 z-[999] mix-blend-difference',
        className
      )}
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        width: cursorSize,
        height: cursorSize
      }}
    >
      <Motion.div
        className="h-full w-full rounded-full"
        style={{
          backgroundColor: cursorColor,
        }}
        animate={{
          scale: isPointer ? 1.5 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 20
        }}
      />
    </Motion.div>
  )
}
