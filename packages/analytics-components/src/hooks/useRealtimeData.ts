'use client'

import { useState, useEffect, useRef } from 'react'

export function useRealtimeData<T>(
  endpoint: string,
  initialData: T,
  interval: number = 5000
) {
  const [data, setData] = useState<T>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate real-time data fetch
        console.log('Fetching real-time data from:', endpoint)
        setIsConnected(true)
        
        // Mock data update
        setData(prevData => ({
          ...prevData,
          // Add random variation to simulate real-time changes
          ...(typeof prevData === 'object' ? { timestamp: Date.now() } : {})
        }))
      } catch (err) {
        setError(err as Error)
        setIsConnected(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up interval
    intervalRef.current = setInterval(fetchData, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [endpoint, interval, initialData])

  return { data, isConnected, error }
}
