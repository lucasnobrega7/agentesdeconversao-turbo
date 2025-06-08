'use client'

import React from 'react'
import { Metric } from '../types'

interface RealTimeMetricsProps {
  metrics: Metric[]
  className?: string
}

export function RealTimeMetrics({ metrics, className = '' }: RealTimeMetricsProps) {
  return (
    <div className={`real-time-metrics ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Métricas em Tempo Real</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Ao vivo</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">{metric.name}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">
                {metric.value.toLocaleString()}
                {metric.unit && <span className="text-lg font-normal">{metric.unit}</span>}
              </span>
              {metric.change !== undefined && (
                <span
                  className={`text-sm ${
                    metric.changeType === 'increase' 
                      ? 'text-green-600' 
                      : metric.changeType === 'decrease' 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                  }`}
                >
                  {metric.changeType === 'increase' && '+'}
                  {metric.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
