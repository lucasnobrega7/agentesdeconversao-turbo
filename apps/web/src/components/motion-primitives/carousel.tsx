'use client'

import { motion as Motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarouselProps {
  children: React.ReactNode[]
  className?: string
  autoPlay?: boolean
  interval?: number
  showArrows?: boolean
  showIndicators?: boolean
}

export function Carousel({
  children,
  className,
  autoPlay = false,
  interval = 5000,
  showArrows = true,
  showIndicators = true
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemWidth = 100 / children.length

  const goToSlide = (index: number) => {
    const newX = -index * 100
    animate(x, newX, {
      type: 'spring',
      stiffness: 300,
      damping: 30
    })
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? children.length - 1 : currentIndex - 1
    goToSlide(newIndex)
  }

  const goToNext = () => {
    const newIndex = currentIndex === children.length - 1 ? 0 : currentIndex + 1
    goToSlide(newIndex)
  }

  useEffect(() => {
    if (autoPlay) {
      const timer = setInterval(goToNext, interval)
      return () => clearInterval(timer)
    }
  }, [autoPlay, interval, currentIndex])

  return (
    <div className={cn('relative overflow-hidden', className)} ref={containerRef}>
      <Motion.div
        className="flex"
        style={{
          x: useTransform(x, (value) => `${value}%`)
        }}
        drag="x"
        dragConstraints={{
          left: -(children.length - 1) * 100,
          right: 0
        }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = Math.abs(offset.x) > 50
          const direction = offset.x > 0 ? -1 : 1
          
          if (swipe && direction === 1 && currentIndex < children.length - 1) {
            goToSlide(currentIndex + 1)
          } else if (swipe && direction === -1 && currentIndex > 0) {
            goToSlide(currentIndex - 1)
          } else {
            goToSlide(currentIndex)
          }
        }}
      >
        {children.map((child, index) => (
          <Motion.div
            key={index}
            className="min-w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {child}
          </Motion.div>
        ))}
      </Motion.div>

      {showArrows && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg transition-all hover:bg-background"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg transition-all hover:bg-background"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                currentIndex === index
                  ? 'w-8 bg-primary'
                  : 'bg-primary/30 hover:bg-primary/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
