'use client'

import { motion as Motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ToolbarItem {
  id: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

interface ToolbarDynamicProps {
  items: ToolbarItem[]
  className?: string
  expanded?: boolean
}

export function ToolbarDynamic({
  items,
  className,
  expanded: defaultExpanded = false
}: ToolbarDynamicProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [activeItem, setActiveItem] = useState<string | null>(null)

  return (
    <Motion.div
      className={cn(
        'flex items-center gap-2 rounded-full bg-background/80 p-2 backdrop-blur-sm',
        className
      )}
      animate={{
        width: isExpanded ? 'auto' : '52px'
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
    >
      {items.map((item) => (
        <Motion.button
          key={item.id}
          onClick={() => {
            setActiveItem(item.id)
            item.onClick?.()
          }}
          className={cn(
            'relative flex items-center gap-2 rounded-full p-2 transition-colors',
            activeItem === item.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex h-6 w-6 items-center justify-center">
            {item.icon}
          </span>
          <AnimatePresence>
            {isExpanded && (
              <Motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap text-sm"
              >
                {item.label}
              </Motion.span>
            )}
          </AnimatePresence>
        </Motion.button>
      ))}
    </Motion.div>
  )
}
