import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as apiGet } from '@/lib/api'
import type { Event, UserRole } from '@/lib/types'

interface EventWithRole extends Event {
  userRole: UserRole
}

interface EventState {
  events: EventWithRole[]
  setEvents: (events: EventWithRole[]) => void
}

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      events: [],
      setEvents: (events) => set({ events }),
    }),
    {
      name: 'event-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

