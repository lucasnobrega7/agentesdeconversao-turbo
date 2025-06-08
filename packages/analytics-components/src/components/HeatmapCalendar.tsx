'use client'

import React from 'react'

interface HeatmapCalendarProps {
  data: {
    date: string
    value: number
  }[]
  className?: string
}

export function HeatmapCalendar({ data, className = '' }: HeatmapCalendarProps) {
  const getIntensity = (value: number) => {
    const max = Math.max(...data.map(d => d.value))
    const intensity = value / max
    if (intensity > 0.8) return 'bg-green-600'
    if (intensity > 0.6) return 'bg-green-500'
    if (intensity > 0.4) return 'bg-green-400'
    if (intensity > 0.2) return 'bg-green-300'
    return 'bg-green-200'
  }
  
  return (
    <div className={`heatmap-calendar ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Atividade</h3>
      <div className="grid grid-cols-7 gap-1">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
          <div key={index} className="text-xs text-center text-muted-foreground">
            {day}
          </div>
        ))}
        {data.slice(0, 35).map((item, index) => (
          <div
            key={index}
            className={`aspect-square rounded ${getIntensity(item.value)}`}
            title={`${item.date}: ${item.value}`}
          />
        ))}
      </div>
    </div>
  )
}
