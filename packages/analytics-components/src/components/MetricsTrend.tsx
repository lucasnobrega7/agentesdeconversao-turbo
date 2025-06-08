'use client'

import React from 'react'

interface MetricsTrendProps {
  data: {
    date: string
    value: number
  }[]
  title: string
  className?: string
}

export function MetricsTrend({ data, title, className = '' }: MetricsTrendProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue
  
  return (
    <div className={`metrics-trend ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="relative h-40">
        <svg className="w-full h-full">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((point.value - minValue) / range) * 100
              return `${x},${y}`
            }).join(' ')}
          />
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}
