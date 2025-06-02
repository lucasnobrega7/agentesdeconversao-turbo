'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, type Agent } from '@/lib/api'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getAgents()
      
      if (response.error) {
        setError(response.error)
        return
      }
      
      if (response.data) {
        setAgents(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agentes')
    } finally {
      setLoading(false)
    }
  }

  const createAgent = async (agentData: Partial<Agent>) => {
    try {
      const response = await apiClient.createAgent(agentData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.data) {
        setAgents(prev => [...prev, response.data!])
        return response.data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agente')
      throw err
    }
  }

  const updateAgent = async (id: string, agentData: Partial<Agent>) => {
    try {
      const response = await apiClient.updateAgent(id, agentData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.data) {
        setAgents(prev => prev.map(agent => 
          agent.id === id ? response.data! : agent
        ))
        return response.data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar agente')
      throw err
    }
  }

  const deleteAgent = async (id: string) => {
    try {
      const response = await apiClient.deleteAgent(id)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      setAgents(prev => prev.filter(agent => agent.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar agente')
      throw err
    }
  }

  const queryAgent = async (id: string, query: string) => {
    try {
      const response = await apiClient.queryAgent(id, query)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar agente')
      throw err
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    queryAgent,
  }
}

export function useAgent(id: string) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getAgent(id)
      
      if (response.error) {
        setError(response.error)
        return
      }
      
      if (response.data) {
        setAgent(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agente')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchAgent()
    }
  }, [id, fetchAgent])

  return {
    agent,
    loading,
    error,
    refetch: fetchAgent,
  }
}