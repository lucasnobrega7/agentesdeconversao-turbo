export const format = {
  currency: (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  },
  
  percentage: (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(value / 100)
  },
  
  date: (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date)
  }
}
