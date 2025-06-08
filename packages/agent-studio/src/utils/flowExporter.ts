import { FlowConfig } from '../types'

export function exportFlow(flowConfig: FlowConfig): string {
  const exportData = {
    ...flowConfig,
    metadata: {
      ...flowConfig.metadata,
      exportedAt: new Date().toISOString(),
      version: flowConfig.metadata?.version || '1.0.0'
    }
  }

  return JSON.stringify(exportData, null, 2)
}

export function importFlow(jsonString: string): FlowConfig | null {
  try {
    const data = JSON.parse(jsonString)
    
    // Validate basic structure
    if (!data.id || !data.name || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      throw new Error('Invalid flow structure')
    }

    return data as FlowConfig
  } catch (error) {
    console.error('Failed to import flow:', error)
    return null
  }
}

export function downloadFlow(flowConfig: FlowConfig, filename?: string) {
  const jsonString = exportFlow(flowConfig)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `flow-${flowConfig.id}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
