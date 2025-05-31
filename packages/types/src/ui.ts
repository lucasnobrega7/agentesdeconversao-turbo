/**
 * UI Component types
 */

import { ReactNode } from 'react'

// Base component props
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
}

// Button variants
export type ButtonVariant = 
  | 'default' 
  | 'destructive' 
  | 'outline' 
  | 'secondary' 
  | 'ghost' 
  | 'link'

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

// Form types
export interface FormFieldProps extends BaseComponentProps {
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// Modal/Dialog types
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Table types
export interface TableColumn<T = any> {
  key: string
  title: string
  render?: (value: any, record: T) => ReactNode
  sortable?: boolean
  width?: string | number
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  onRowClick?: (record: T) => void
}

// Chart types
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface ChartProps extends BaseComponentProps {
  data: ChartDataPoint[]
  type: 'line' | 'bar' | 'pie' | 'area'
  width?: number
  height?: number
  animate?: boolean
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Toast/Notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title?: string
  description?: string
  type?: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}