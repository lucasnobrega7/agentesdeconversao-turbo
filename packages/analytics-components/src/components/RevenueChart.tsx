'use client'

import React from 'react'
import { ChartData } from '../types'

interface RevenueChartProps {
  data: ChartData
  height?: number
  className?: string
}

export function RevenueChart({ data, height = 300, className = '' }: RevenueChartProps) {
  // Simplified chart component - in production, use a chart library like recharts
  const maxValue = Math.max(...(data.datasets?.[0]?.data || []))
  
  return (
    <div className={`revenue-chart ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Receita</h3>
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {data.labels.map((label, index) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                style={{
                  height: `${((data.datasets?.[0]?.data?.[index] || 0) / maxValue) * 100}%`
                }}
              />
              <span className="text-xs text-muted-foreground mt-2">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
