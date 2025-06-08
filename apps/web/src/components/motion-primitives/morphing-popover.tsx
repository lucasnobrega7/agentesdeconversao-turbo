'use client'

import { motion as Motion, AnimatePresence } from 'motion/react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface MorphingPopoverProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function MorphingPopover({
  children,
  content,
  className,
  side = 'bottom'
}: MorphingPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const positions = {
        top: { top: rect.top - 10, left: rect.left + rect.width / 2 },
        bottom: { top: rect.bottom + 10, left: rect.left + rect.width / 2 },
        left: { top: rect.top + rect.height / 2, left: rect.left - 10 },
        right: { top: rect.top + rect.height / 2, left: rect.right + 10 }
      }
      setPosition(positions[side])
    }
  }, [isOpen, side])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            className={cn(
              'fixed z-50 rounded-lg bg-popover p-4 shadow-lg',
              className
            )}
            style={{
              top: position.top,
              left: position.left,
              transform: side === 'top' || side === 'bottom' 
                ? 'translateX(-50%)' 
                : 'translateY(-50%)'
            }}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300
            }}
          >
            {content}
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
