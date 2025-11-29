'use client'

import { useEffect, useState } from 'react'
import { get } from '@/lib/api'
import { Event, UserRole } from '@/lib/types'

interface EventWithRole extends Event {
  userRole: UserRole
}

interface UseEventsReturn {
  events: EventWithRole[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<EventWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await get<{ events: EventWithRole[] }>('/api/events')
      setEvents(response.events)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  }
}

interface UseEventReturn {
  event: EventWithRole | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEvent(eventId: string): UseEventReturn {
  const [event, setEvent] = useState<EventWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await get<{ event: EventWithRole }>(`/api/events/${eventId}`)
      setEvent(response.event)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event')
      console.error('Error fetching event:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  }
}
