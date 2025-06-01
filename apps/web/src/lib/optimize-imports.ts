/**
 * Import optimization utilities for Turbopack
 * These utilities help ensure optimal bundling and tree-shaking
 */

import React from 'react'
import type { ComponentType } from 'react'

// Dynamic import helper with loading state
export async function dynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: React.ComponentType
    error?: React.ComponentType<{ error: Error }>
  }
) {
  try {
    const module = await importFn()
    return module.default
  } catch (error) {
    if (options?.error) {
      throw error
    }
    console.error('Dynamic import failed:', error)
    throw error
  }
}

// Lazy component loader optimized for Turbopack
export function lazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): T {
  // For now, just return the lazy component directly
  // The type casting is complex here due to React.lazy's return type
  return React.lazy(importFn) as any
}

// Conditional import based on environment
export function conditionalImport<T>(
  condition: boolean,
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> {
  if (condition) {
    return importFn().then(m => m.default)
  }
  return Promise.resolve(fallback as T)
}

// Import with retry mechanism
export async function importWithRetry<T>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const module = await importFn()
      return module.default
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Import failed after retries')
}

// Preload critical components
export function preloadComponent(
  importFn: () => Promise<any>
): void {
  if (typeof window !== 'undefined') {
    // Preload in the background
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        importFn().catch(console.error)
      })
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        importFn().catch(console.error)
      }, 1)
    }
  }
}

// Icon import optimizer
export function optimizeIconImport(iconName: string) {
  // Instead of importing all icons, import only what's needed
  return import('lucide-react').then(module => (module as any)[iconName])
}

// Re-export commonly used utilities
export { lazy as lazyReact, Suspense } from 'react'
import dynamic from 'next/dynamic'
export { dynamic as dynamicNext }
