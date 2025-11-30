'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Music, Users, DoorOpen, Loader2, AlertCircle, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEvents } from "@/hooks/use-events"
import { get } from "@/lib/api"
import { useOnlineStatus } from "@/hooks/use-online-status"

const getIconForType = (category: string) => {
  const cat = category.toLowerCase()
  if (cat.includes('técnico') || cat.includes('backline') || cat.includes('sonido')) return Users
  if (cat.includes('escenario') || cat.includes('show')) return Music
  if (cat.includes('catering') || cat.includes('hospitality')) return DoorOpen
  if (cat.includes('general')) return Users
  return Clock
}

// Tipo que refleja exactamente la respuesta del endpoint de cache
type TimelineApiResponse = {
  event_id: string
  timeline: {
    timelines: { category: string; items: { label: string; date: string }[] }[]
  }
  updated_at: string
}

export default function TimelinePage() {
  const { events, loading: eventsLoading } = useEvents()
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isOnline = useOnlineStatus()
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [timelineData, setTimelineData] = useState<TimelineApiResponse["timeline"] | null>(null)

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId])

  const fetchTimeline = async (eventId: string) => {
    if (!eventId) return

    setLoading(true)
    setError('')
    try {
      const response = await get<TimelineApiResponse>(
        `/api/events/${eventId}/timeline/cache`
      )

      // Guardamos directamente la estructura que viene del backend
      setTimelineData(response.timeline)
    } catch (err) {
      setTimelineData(null)
      setError(err instanceof Error ? err.message : 'Error al cargar timeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedEventId && isOnline) {
      fetchTimeline(selectedEventId)
    }
  }, [selectedEventId, isOnline])

  // Inicializar todas las categorías como expandidas cuando cambia el timeline
  useEffect(() => {
    if (timelineData?.timelines) {
      setExpandedCategories(new Set(timelineData.timelines.map((_, index) => index)))
    } else {
      setExpandedCategories(new Set())
    }
  }, [timelineData])

  const toggleCategory = (index: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const formatTime = (datetime: string) => {
    return datetime
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cronograma del Evento</h1>
          {selectedEvent && <p className="text-muted-foreground mt-1">{selectedEvent.name}</p>}
        </div>
      </div>

      {/* Event Selection */}
      {eventsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !events ? (
        <Card className="border-slate-200 dark:border-zinc-800">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">No tienes eventos disponibles.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-8">
            <label className="text-sm font-medium">Evento:</label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId} disabled={!isOnline && events.length > 0}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecciona un evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isOnline && events.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Estás offline. Mostrando datos en caché.</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : !timelineData || !timelineData.timelines || timelineData.timelines.length === 0 ? (
            <Card className="border-slate-200 dark:border-zinc-800">
              <CardContent className="p-8 text-center">
                <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  No hay entradas en el timeline
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Este evento aún no tiene un cronograma definido.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-10">
              {timelineData.timelines.map((category, catIndex) => {
                const isExpanded = expandedCategories.has(catIndex)
                const Icon = getIconForType(category.category)

                return (
                  <div key={catIndex}>
                    <button
                      onClick={() => toggleCategory(catIndex)}
                      className="w-full text-left mb-4 flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-3 h-3 rounded-full bg-black dark:bg-white" />
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex-1">
                        {category.category}
                      </h2>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[14px] before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-zinc-800 transition-all duration-300">
                        {category.items.map((entry, entryIndex) => {
                          return (
                            <div key={entryIndex} className="relative">
                              {/* Dot on timeline */}
                              <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-4 border-white dark:border-zinc-950 shadow-sm bg-black dark:bg-white" />

                              <Card className="hover:shadow-md transition-shadow duration-200 border-gray-200 dark:border-zinc-800">
                                <CardContent className="p-5 flex gap-4 items-center">
                                  {/* Time & Icon Box */}
                                  <div className="shrink-0 flex flex-col items-center justify-center w-24 h-16 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800">
                                    <span className="font-bold text-black dark:text-white text-center text-xs leading-tight">
                                      {formatTime(entry.date)}
                                    </span>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                                      {entry.label}
                                    </h3>
                                  </div>
                                  <div className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800">
                                    <Icon className="h-5 w-5 text-black dark:text-white" />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}