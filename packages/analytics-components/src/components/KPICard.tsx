'use client'

import React from 'react'
import { Metric } from '../types'

interface KPICardProps {
  metric: Metric
  icon?: React.ReactNode
  className?: string
}

export function KPICard({ metric, icon, className = '' }: KPICardProps) {
  return (
    <div className={`kpi-card p-6 border rounded-lg ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{metric.name}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold">
              {metric.value.toLocaleString()}
              {metric.unit && <span className="text-xl font-normal ml-1">{metric.unit}</span>}
            </span>
            {metric.change !== undefined && (
              <span
                className={`text-sm font-medium ${
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
          {metric.description && (
            <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </div>
    </div>
  )
}
