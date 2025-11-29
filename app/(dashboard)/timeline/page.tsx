'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Music, Users, DoorOpen, FileCheck, Loader2, AlertCircle, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEvents } from "@/hooks/use-events"
import { get } from "@/lib/api"
import type { TimelineEntry } from "@/lib/types"

const getIconForType = (type: string) => {
  switch (type) {
    case 'rehearsal': return Music
    case 'soundcheck': return Users
    case 'logistics': return DoorOpen
    case 'show': return Music
    case 'meeting': return FileCheck
    default: return Clock
  }
}

const getTypeColor = (type: string) => {
    switch(type) {
        case 'rehearsal': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'soundcheck': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'logistics': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'show': return 'bg-gray-100 text-gray-600 border-gray-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
}

const getTypeDot = (type: string) => {
    switch(type) {
        case 'rehearsal': return 'bg-gray-500';
        case 'soundcheck': return 'bg-gray-500';
        case 'logistics': return 'bg-gray-500';
        case 'show': return 'bg-gray-500';
        default: return 'bg-gray-500';
    }
}

export default function TimelinePage() {
  const { events, loading: eventsLoading } = useEvents()
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Set first event as selected when events load
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId])

  // Fetch timeline when event is selected
  useEffect(() => {
    if (selectedEventId) {
      fetchTimeline()
    }
  }, [selectedEventId])

  const fetchTimeline = async () => {
    if (!selectedEventId) return

    setLoading(true)
    setError('')
    try {
      const response = await get<{ timeline: TimelineEntry[] }>(`/api/events/${selectedEventId}/timeline`)
      setTimeline(response.timeline)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar timeline')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cronograma del Evento</h1>
      </div>

      {/* Event Selection */}
      {eventsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : events.length === 0 ? (
        <Card className="border-slate-200 dark:border-zinc-800">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">No tienes eventos disponibles.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-8">
            <label className="text-sm font-medium">Evento:</label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
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
          ) : timeline.length === 0 ? (
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
            <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-3.5 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-zinc-800">
              {timeline.map((entry) => {
                const Icon = getIconForType(entry.type)
                return (
                  <div key={entry.id} className="relative">
                    {/* Dot on timeline */}
                    <div className={cn(
                      "absolute -left-[34px] mt-1.5 h-4 w-4 rounded-full border-4 border-white dark:border-zinc-950 shadow-sm",
                      getTypeDot(entry.type)
                    )} />

                    <Card className="hover:shadow-md transition-shadow duration-200 border-gray-200 dark:border-zinc-800">
                      <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        {/* Time & Icon Box */}
                        <div className={cn(
                          "flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl border",
                          getTypeColor(entry.type)
                        )}>
                          <Icon className="h-6 w-6 mb-1" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="h-6 font-mono text-xs tracking-wider">
                              {formatTime(entry.time)}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                            {entry.description}
                          </h3>

                          {entry.location && (
                            <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400 text-sm">
                              <MapPin className="h-4 w-4" />
                              <span>{entry.location}</span>
                            </div>
                          )}

                          {entry.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
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