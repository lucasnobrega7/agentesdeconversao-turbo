'use client'

import { motion as Motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MorphingDialogProps {
  children: React.ReactNode
  className?: string
  trigger: React.ReactNode
  variant?: 'scale' | 'slide' | 'morph'
}

export function MorphingDialog({
  children,
  className,
  trigger,
  variant = 'morph'
}: MorphingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const variants = {
    scale: {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.5 }
    },
    slide: {
      initial: { opacity: 0, y: 100 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 100 }
    },
    morph: {
      initial: { opacity: 0, scale: 0.8, borderRadius: '100%' },
      animate: { opacity: 1, scale: 1, borderRadius: '0.5rem' },
      exit: { opacity: 0, scale: 0.8, borderRadius: '100%' }
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            
            <Motion.div
              className={cn(
                'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-background p-6 shadow-lg',
                className
              )}
              {...variants[variant]}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4"
              >
                <X className="h-4 w-4" />
              </button>
              {children}
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
