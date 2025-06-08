export function formatMetric(value: number, type: string = 'number'): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    
    case 'percentage':
      return `${value.toFixed(1)}%`
    
    case 'time':
      if (value < 60) return `${value}s`
      if (value < 3600) return `${Math.floor(value / 60)}min`
      return `${Math.floor(value / 3600)}h`
    
    case 'compact':
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
      return value.toString()
    
    default:
      return value.toLocaleString('pt-BR')
  }
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'long') {
    return d.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return d.toLocaleDateString('pt-BR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  })
}
