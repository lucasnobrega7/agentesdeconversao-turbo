'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        return
      }

      // Fetch organizations the user belongs to
      const { data: memberships, error: membershipError } = await supabase
        .from('memberships')
        .select('organization_id, organizations(*)')
        .eq('user_id', user.id)

      if (membershipError) throw membershipError

      const orgs = memberships?.map(m => m.organizations).filter(Boolean) || []
      setOrganizations(orgs as Organization[])
      
      // Set first organization as current if none selected
      if (orgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgs[0] as Organization)
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
      setError('Failed to fetch organizations')
    } finally {
      setLoading(false)
    }
  }

  const switchOrganization = (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId)
    if (org) {
      setCurrentOrganization(org)
      // Store in localStorage for persistence
      localStorage.setItem('currentOrganizationId', organizationId)
    }
  }

  return {
    organizations,
    currentOrganization,
    loading,
    error,
    switchOrganization,
    refetch: fetchOrganizations
  }
}