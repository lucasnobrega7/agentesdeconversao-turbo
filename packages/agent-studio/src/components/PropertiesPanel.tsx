'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Trash2, Copy, Code } from 'lucide-react'
import { useFlowStore } from '../store/flowStore'
import { MonacoEditor } from './MonacoEditor'

interface PropertiesPanelProps {
  nodeId: string
  onUpdate: (data: any) => void
}

export function PropertiesPanel({ nodeId, onUpdate }: PropertiesPanelProps) {
  const { nodes, deleteNode } = useFlowStore()
  const node = nodes.find(n => n.id === nodeId)
  const [formData, setFormData] = useState<any>({})
  const [showCodeEditor, setShowCodeEditor] = useState(false)

  useEffect(() => {
    if (node) {
      setFormData(node.data || {})
    }
  }, [node])

  if (!node) return null

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja deletar este nó?')) {
      deleteNode(nodeId)
    }
  }

  const handleDuplicate = () => {
    // Implementar duplicação
  }

  const renderFields = () => {
    switch (node.type) {
      case 'message':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem
              </label>
              <textarea
                value={formData.message || ''}
                onChange={(e) => handleChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Digite a mensagem..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay (ms)
              </label>
              <input
                type="number"
                value={formData.delay || 0}
                onChange={(e) => handleChange('delay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="100"
              />
            </div>
          </>
        )

      case 'prompt':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt do Sistema
              </label>
              <textarea
                value={formData.systemPrompt || ''}
                onChange={(e) => handleChange('systemPrompt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Defina o comportamento da IA..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <select
                value={formData.model || 'gpt-3.5-turbo'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura
              </label>
              <input
                type="range"
                value={formData.temperature || 0.7}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                className="w-full"
                min="0"
                max="2"
                step="0.1"
              />
              <div className="text-xs text-gray-500 text-center">
                {formData.temperature || 0.7}
              </div>
            </div>
          </>
        )

      case 'condition':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Condição
              </label>
              <select
                value={formData.conditionType || 'contains'}
                onChange={(e) => handleChange('conditionType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="contains">Contém</option>
                <option value="equals">Igual a</option>
                <option value="startsWith">Começa com</option>
                <option value="endsWith">Termina com</option>
                <option value="regex">Regex</option>
                <option value="custom">Código Customizado</option>
              </select>
            </div>
            {formData.conditionType === 'custom' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código JavaScript
                  <button
                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <Code size={16} className="inline" />
                  </button>
                </label>
                {showCodeEditor ? (
                  <MonacoEditor
                    value={formData.customCode || '// return true or false\n'}
                    onChange={(value) => handleChange('customCode', value)}
                    language="javascript"
                    height="200px"
                  />
                ) : (
                  <textarea
                    value={formData.customCode || ''}
                    onChange={(e) => handleChange('customCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={6}
                    placeholder="// return true or false"
                  />
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="text"
                  value={formData.conditionValue || ''}
                  onChange={(e) => handleChange('conditionValue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Valor para comparar..."
                />
              </div>
            )}
          </>
        )

      case 'api':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.exemplo.com/endpoint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método
              </label>
              <select
                value={formData.method || 'GET'}
                onChange={(e) => handleChange('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headers (JSON)
              </label>
              <textarea
                value={formData.headers || '{}'}
                onChange={(e) => handleChange('headers', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={3}
                placeholder='{"Authorization": "Bearer token"}'
              />
            </div>
          </>
        )

      default:
        return (
          <div className="text-gray-500 text-sm">
            Propriedades não configuradas para este tipo de nó
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Propriedades</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDuplicate}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Duplicar"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-red-500 hover:text-red-700"
              title="Deletar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-sm text-gray-600">ID: {node.id}</div>
          <div className="text-sm text-gray-600">Tipo: {node.type}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Nó
            </label>
            <input
              type="text"
              value={formData.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome descritivo..."
            />
          </div>

          {renderFields()}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            // Salvar é automático, mas podemos adicionar feedback
            console.log('Propriedades salvas:', formData)
          }}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
        >
          <Save size={16} />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  )
}
