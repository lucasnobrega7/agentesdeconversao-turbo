'use client'

import { useEffect, useRef } from 'react'

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener(mouseEvent, handleClickOutside)

    return () => {
      document.removeEventListener(mouseEvent, handleClickOutside)
    }
  }, [handler, mouseEvent])

  return ref
}
