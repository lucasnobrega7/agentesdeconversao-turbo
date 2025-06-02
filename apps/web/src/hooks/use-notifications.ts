'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'

export interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type?: 'info' | 'success' | 'warning' | 'error'
  user_id?: string
  created_at?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { toast } = useToast()
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Demo notifications for fallback
  const demoNotifications: Notification[] = [
    {
      id: '1',
      title: 'Novo agente criado',
      description: 'Seu agente "Assistente de Vendas" foi criado com sucesso.',
      time: 'Há 5 minutos',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Conversa transferida',
      description: 'Uma conversa foi transferida para você por João Silva.',
      time: 'Há 1 hora',
      read: true,
      type: 'info'
    },
    {
      id: '3',
      title: 'Documento processado',
      description: 'Seu documento "Manual de Produtos" foi processado com sucesso.',
      time: 'Há 3 horas',
      read: true,
      type: 'success'
    },
  ]

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Use demo notifications if no user
        setNotifications(demoNotifications)
        setUnreadCount(demoNotifications.filter(n => !n.read).length)
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedNotifications = data?.map(n => ({
        ...n,
        time: formatTime(n.created_at)
      })) || demoNotifications

      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Fallback to demo notifications
      setNotifications(demoNotifications)
      setUnreadCount(demoNotifications.filter(n => !n.read).length)
    } finally {
      setLoading(false)
    }
  }, [supabase, demoNotifications])

  const markAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (!notification || notification.read) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId)
          .eq('user_id', user.id)
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false)
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const subscribeToNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    channelRef.current = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = {
            ...payload.new,
            time: formatTime(payload.new.created_at)
          } as Notification

          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)

          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.description,
            variant: newNotification.type === 'error' ? 'destructive' : 'default'
          })
        }
      )
      .subscribe()
  }, [supabase, toast])

  useEffect(() => {
    fetchNotifications()
    subscribeToNotifications()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [fetchNotifications, subscribeToNotifications, supabase])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `Há ${diffMins} minutos`
  } else if (diffHours < 24) {
    return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  } else if (diffDays < 7) {
    return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('pt-BR')
  }
}