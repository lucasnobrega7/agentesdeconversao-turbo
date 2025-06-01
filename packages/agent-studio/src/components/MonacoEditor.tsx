'use client'

import React from 'react'
import Editor from '@monaco-editor/react'

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  theme?: string
}

export function MonacoEditor({ 
  value, 
  onChange, 
  language = 'javascript',
  height = '200px',
  theme = 'vs-dark'
}: MonacoEditorProps) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        theme={theme}
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on'
        }}
      />
    </div>
  )
}
