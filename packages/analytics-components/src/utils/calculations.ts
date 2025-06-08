export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return ((sorted[mid - 1] || 0) + (sorted[mid] || 0)) / 2
  }
  
  return sorted[mid] || 0
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  
  const sorted = [...values].sort((a, b) => a - b)
  const index = (percentile / 100) * (sorted.length - 1)
  
  if (Math.floor(index) === index) {
    return sorted[index] || 0
  }
  
  const lower = sorted[Math.floor(index)] || 0
  const upper = sorted[Math.ceil(index)] || 0
  const weight = index % 1
  
  return lower + (upper - lower) * weight
}

export function calculateConversionRate(conversions: number, visitors: number): number {
  if (visitors === 0) return 0
  return (conversions / visitors) * 100
}
