'use client'

import React from 'react'

interface ConversionFunnelProps {
  data: {
    stage: string
    value: number
    percentage: number
  }[]
  className?: string
}

export function ConversionFunnel({ data, className = '' }: ConversionFunnelProps) {
  return (
    <div className={`conversion-funnel ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Funil de Conversão</h3>
      <div className="space-y-3">
        {data.map((stage, index) => (
          <div key={stage.stage} className="relative">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{stage.stage}</span>
              <span className="text-sm text-muted-foreground">
                {stage.value.toLocaleString()} ({stage.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-primary h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${stage.percentage}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {stage.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
