export const validators = {
  email: (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },
  
  phone: (phone: string) => {
    return /^\d{10,11}$/.test(phone.replace(/\D/g, ''))
  }
}
