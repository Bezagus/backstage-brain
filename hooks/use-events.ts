'use client'

import { useEffect, useState } from 'react'
import { get, supabase } from '@/lib/api'
import { Event, UserRole } from '@/lib/types'
import { useEventStore } from '@/lib/eventStore'
import { useOnlineStatus } from './use-online-status'

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
  const { events, setEvents } = useEventStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isOnline = useOnlineStatus()

  const fetchEvents = async () => {
    if (!isOnline) {
      setLoading(false)
      if (events.length === 0) {
        setError("Estás offline y no hay eventos en caché.")
      }
      return
    }
    try {
      setLoading(true)
      setError(null)

      // Check if user is authenticated before making API call
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const response = await get<{ events: EventWithRole[] }>('/api/events')
      setEvents(response.events)
    } catch (err) {
      // Only log error if it's not an auth issue
      if (err instanceof Error && !err.message.includes('Auth session')) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events')
        console.error('Error fetching events:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [isOnline])

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

      // Check if user is authenticated before making API call
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const response = await get<{ event: EventWithRole }>(`/api/events/${eventId}`)
      setEvent(response.event)
    } catch (err) {
      // Only log error if it's not an auth issue
      if (err instanceof Error && !err.message.includes('Auth session')) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event')
        console.error('Error fetching event:', err)
      }
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
