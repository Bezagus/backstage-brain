import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface TimelineEvent {
  datetime: string
  label: string
}

export interface TimelineCategory {
  category: string
  events: TimelineEvent[]
}

export interface TimelineData {
  event_name?: string
  artist?: string
  date?: string
  timeline: TimelineCategory[]
}

interface TimelineState {
  timelineByEvent: { [eventId: string]: TimelineData }
  setTimeline: (eventId: string, data: TimelineData) => void
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set) => ({
      timelineByEvent: {},
      setTimeline: (eventId, data) =>
        set((state) => ({
          timelineByEvent: {
            ...state.timelineByEvent,
            [eventId]: data,
          },
        })),
    }),
    {
      name: 'timeline-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

