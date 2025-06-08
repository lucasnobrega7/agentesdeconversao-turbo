'use client'

import { motion as Motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SlidingNumberProps {
  value: number
  className?: string
  duration?: number
  showSlider?: boolean
  min?: number
  max?: number
  onValueChange?: (value: number) => void
}

export function SlidingNumber({
  value,
  className,
  duration = 0.5,
  showSlider = false,
  min = 0,
  max = 100,
  onValueChange
}: SlidingNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const motionValue = useMotionValue(value)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))

  useEffect(() => {
    const unsubscribe = rounded.onChange((v) => setDisplayValue(v))
    return unsubscribe
  }, [rounded])

  useEffect(() => {
    animate(motionValue, value, {
      duration,
      ease: 'easeInOut'
    })
  }, [value, motionValue, duration])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    onValueChange?.(newValue)
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Motion.span className="text-4xl font-bold tabular-nums">
        {displayValue}
      </Motion.span>
      {showSlider && (
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="w-full"
        />
      )}
    </div>
  )
}
