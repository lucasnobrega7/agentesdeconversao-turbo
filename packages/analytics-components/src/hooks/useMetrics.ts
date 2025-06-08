'use client'

import { useState, useEffect } from 'react'
import { Metric, TimeRange } from '../types'

export function useMetrics(timeRange: TimeRange = 'day') {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock data
        setMetrics([
          {
            id: 'visitors',
            name: 'Visitantes',
            value: 1234,
            previousValue: 1100,
            change: 12.2,
            changeType: 'increase'
          },
          {
            id: 'conversions',
            name: 'Conversões',
            value: 89,
            previousValue: 75,
            change: 18.7,
            changeType: 'increase'
          },
          {
            id: 'revenue',
            name: 'Receita',
            value: 45678,
            previousValue: 42000,
            change: 8.7,
            changeType: 'increase',
            unit: 'R$'
          }
        ])
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [timeRange])

  return { metrics, isLoading, error }
}
