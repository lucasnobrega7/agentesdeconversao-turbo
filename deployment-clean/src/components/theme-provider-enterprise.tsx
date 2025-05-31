'use client'

import React from 'react'
import { ThemeProvider } from 'next-themes'

// 🎨 Theme Provider Enterprise - Convergência Material + Custom

export function ThemeProviderEnterprise({
  children,
  ...props
}: React.ComponentProps<typeof ThemeProvider>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={['light', 'dark', 'ai-dark', 'enterprise']}
      {...props}
    >
      {children}
    </ThemeProvider>
  )
}
