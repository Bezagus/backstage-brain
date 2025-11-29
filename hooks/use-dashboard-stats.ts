'use client'

import { useEffect, useState } from 'react'
import { get } from '@/lib/api'

export interface DashboardStats {
  totalFiles: number
  filesToday: number
  lastUpdate: string | null
  showsToday: number
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await get<DashboardStats>('/api/dashboard/stats')
      setStats(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}

