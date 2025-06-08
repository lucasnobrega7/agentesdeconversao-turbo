'use client'

import { motion as Motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface DockProps {
  children: React.ReactNode
  className?: string
  magnification?: number
  distance?: number
}

interface DockItemProps {
  children: React.ReactNode
  className?: string
}

export function Dock({
  children,
  className,
  magnification = 60,
  distance = 140
}: DockProps) {
  const mouseX = useMotionValue(Infinity)

  return (
    <Motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'flex h-16 items-end gap-2 rounded-2xl bg-gray-800/60 px-4 pb-3 backdrop-blur-md',
        className
      )}
    >
      {Array.isArray(children) ? children.map((child, i) => (
        <DockIcon
          key={i}
          mouseX={mouseX}
          magnification={magnification}
          distance={distance}
        >
          {child}
        </DockIcon>
      )) : (
        <DockIcon
          mouseX={mouseX}
          magnification={magnification}
          distance={distance}
        >
          {children}
        </DockIcon>
      )}
    </Motion.div>
  )
}

function DockIcon({
  mouseX,
  magnification,
  distance,
  children
}: {
  mouseX: any
  magnification: number
  distance: number
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [40, magnification, 40]
  )

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12
  })

  return (
    <Motion.div
      ref={ref}
      style={{ width }}
      className="flex aspect-square cursor-pointer items-center justify-center rounded-full bg-gray-600/50 backdrop-blur-sm"
    >
      {children}
    </Motion.div>
  )
}

export { DockIcon as DockItem }
