'use client'

import { useEffect } from 'react'

export function usePreventScroll(isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return

    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isActive])
}
