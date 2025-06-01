'use client'

import React from 'react'
import { AgentStudio } from './AgentStudio'

interface FlowEditorProps {
  flowId?: string
  onSave?: (flow: any) => void
  readonly?: boolean
}

export function FlowEditor(props: FlowEditorProps) {
  return <AgentStudio {...props} />
}
