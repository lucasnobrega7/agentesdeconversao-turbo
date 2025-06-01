'use client'

import React from 'react'
import { Save, Play, Download, Upload, Undo, Redo, Grid3x3 } from 'lucide-react'

interface FlowToolbarProps {
  onSave: () => void
  onSimulate: () => void
  readonly?: boolean
}

export function FlowToolbar({ onSave, onSimulate, readonly }: FlowToolbarProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center space-x-2">
      {!readonly && (
        <>
          <button
            onClick={onSave}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-1"
            title="Salvar"
          >
            <Save size={18} />
            <span className="text-sm">Salvar</span>
          </button>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <button
            onClick={() => {/* Implementar undo */}}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Desfazer"
          >
            <Undo size={18} />
          </button>
          
          <button
            onClick={() => {/* Implementar redo */}}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Refazer"
          >
            <Redo size={18} />
          </button>
          
          <div className="w-px h-6 bg-gray-300" />
        </>
      )}
      
      <button
        onClick={onSimulate}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-1"
        title="Simular"
      >
        <Play size={18} />
        <span className="text-sm">Simular</span>
      </button>
      
      <button
        onClick={() => {/* Implementar export */}}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        title="Exportar"
      >
        <Download size={18} />
      </button>
      
      <button
        onClick={() => {/* Implementar import */}}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        title="Importar"
      >
        <Upload size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-300" />
      
      <button
        onClick={() => {/* Implementar auto-layout */}}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        title="Auto Layout"
      >
        <Grid3x3 size={18} />
      </button>
    </div>
  )
}
