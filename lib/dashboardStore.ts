import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Event, UserRole, DashboardStats } from './types'

export interface CachedEvent extends Event {
  userRole?: UserRole
}

export interface DashboardStoreState {
  events: CachedEvent[]
  stats: DashboardStats | null
  setEvents: (events: CachedEvent[]) => void
  setStats: (stats: DashboardStats | null) => void
  clear: () => void
}

export const useDashboardStore = create<DashboardStoreState>()(
  persist<DashboardStoreState>(
    (set) => ({
      events: [],
      stats: null,
      setEvents: (events: CachedEvent[]) => set(() => ({ events })),
      setStats: (stats: DashboardStats | null) => set(() => ({ stats })),
      clear: () => set(() => ({ events: [], stats: null })),
    }),
    {
      name: 'dashboard-store-v1',
    }
  )
)
