'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Music, Users, DoorOpen,  Loader2, AlertCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEvents } from "@/hooks/use-events"
import { get } from "@/lib/api"
import { useTimelineStore, TimelineData } from '@/lib/timelineStore'
import { useOnlineStatus } from '@/hooks/use-online-status'

const getIconForType = (category: string) => {
  const cat = category.toLowerCase()
  if (cat.includes('técnico') || cat.includes('backline') || cat.includes('sonido')) return Users
  if (cat.includes('escenario') || cat.includes('show')) return Music
  if (cat.includes('catering') || cat.includes('hospitality')) return DoorOpen
  if (cat.includes('general')) return Users
  return Clock
}

const getTypeColor = (category: string) => {
    const cat = category.toLowerCase()
    if (cat.includes('técnico')) return 'bg-blue-100 text-blue-600 border-blue-200'
    if (cat.includes('escenario')) return 'bg-purple-100 text-purple-600 border-purple-200'
    if (cat.includes('catering')) return 'bg-amber-100 text-amber-600 border-amber-200'
    if (cat.includes('general')) return 'bg-gray-100 text-gray-600 border-gray-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
}

const getTypeDot = (category: string) => {
    const cat = category.toLowerCase()
    if (cat.includes('técnico')) return 'bg-blue-500'
    if (cat.includes('escenario')) return 'bg-purple-500'
    if (cat.includes('catering')) return 'bg-amber-500'
    if (cat.includes('general')) return 'bg-gray-500'
    return 'bg-gray-500'
}

export default function TimelinePage() {
  const { events, loading: eventsLoading } = useEvents()
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const { timelineByEvent, setTimeline } = useTimelineStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isOnline = useOnlineStatus()

  const timelineData = timelineByEvent[selectedEventId]

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
      const response = await get<{ timelines: { category: string; items: { label: string; date: string }[] }[] }>(
        `/api/events/${eventId}/timeline`
      )

      const normalized: TimelineData = {
        timeline: response.timelines.map((group) => ({
          category: group.category,
          events: group.items.map((item) => ({
            label: item.label,
            datetime: item.date,
          })),
        })),
      }

      setTimeline(eventId, normalized)
    } catch (err) {
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

  const formatTime = (datetime: string) => {
    const parts = datetime.split(' - ')
    return parts.length > 1 ? parts[1] : datetime
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

          {error && (
            <div className="flex items-center gap-2 p-4 mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : !timelineData ? (
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
              {timelineData.timeline.map((category, catIndex) => (
                <div key={catIndex}>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
                     <div className={cn("w-3 h-3 rounded-full", getTypeDot(category.category))} />
                    {category.category}
                  </h2>
                  <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-3.5 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-zinc-800">
                    {category.events.map((entry, entryIndex) => {
                      const Icon = getIconForType(category.category)
                      return (
                        <div key={entryIndex} className="relative">
                          {/* Dot on timeline */}
                          <div className={cn(
                            "absolute -left-[34px] mt-1.5 h-4 w-4 rounded-full border-4 border-white dark:border-zinc-950 shadow-sm",
                            getTypeDot(category.category)
                          )} />

                          <Card className="hover:shadow-md transition-shadow duration-200 border-gray-200 dark:border-zinc-800">
                            <CardContent className="p-5 flex gap-4 items-center">
                              {/* Time & Icon Box */}
                              <div className={cn(
                                "flex-shrink-0 flex flex-col items-center justify-center w-24 h-16 rounded-2xl border",
                                getTypeColor(category.category)
                              )}>
                                <span className="font-bold text-lg">{formatTime(entry.datetime)}</span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                                  {entry.label}
                                </h3>
                              </div>
                              <div className={cn("p-2 rounded-full", getTypeColor(category.category))}>
                                <Icon className="h-5 w-5" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}