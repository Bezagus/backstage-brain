'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Tag, FileText, Edit3, Trash2, Save, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { get, put, del } from '@/lib/api'
import type { Event, UserRole } from '@/lib/types'

type EventWithRole = Event & { userRole: UserRole }

interface EventResponse {
  event: EventWithRole
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [event, setEvent] = useState<EventWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await get<EventResponse>(`/api/events/${id}`)
      setEvent(response.event)
      setForm({
        name: response.event.name,
        date: response.event.date,
        location: response.event.location || '',
        description: response.event.description || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el evento')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: keyof typeof form,
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleDateChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      date: value,
    }))
  }

  const handleEdit = () => {
    setIsEditing(true)
    setSuccess(null)
    setError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSuccess(null)
    setError(null)
    if (event) {
      setForm({
        name: event.name,
        date: event.date,
        location: event.location || '',
        description: event.description || '',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.name.trim() || !form.date || !form.location.trim()) {
      setError('Completa el nombre, la fecha y la ubicación del evento')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await put<EventResponse>(`/api/events/${id}`, {
        name: form.name.trim(),
        date: form.date,
        location: form.location.trim(),
        description: form.description.trim() || null,
      })

      setEvent(response.event)
      setSuccess('Evento actualizado correctamente')
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el evento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      await del(`/api/events/${id}`)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el evento')
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) return null

  const canEdit = event.userRole === 'ADMIN' || event.userRole === 'MANAGER'
  const canDelete = event.userRole === 'ADMIN'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-black dark:text-white" />
            Detalles del evento
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {event.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date(event.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-black dark:text-white" />
          Volver al dashboard
        </Link>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-200" />
          {success}
        </div>
      )}

      {error && event && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-300" />
          {error}
        </div>
      )}

      <Card className="border-slate-200 dark:border-zinc-800 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Información del evento</CardTitle>
              <CardDescription>
                {isEditing ? 'Edita los detalles del evento' : 'Detalles y configuración del evento'}
              </CardDescription>
            </div>
            {!isEditing && canEdit && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit3 className="h-4 w-4 mr-2 text-black dark:text-white" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="event-name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Nombre del evento
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black dark:text-white pointer-events-none" />
                  <Input
                    id="event-name"
                    placeholder="Ej. Festival Backstage 2025"
                    value={form.name}
                    onChange={handleChange('name')}
                    disabled={submitting}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Fecha y hora
                </label>
                <DateTimePicker
                  value={form.date}
                  onChange={handleDateChange}
                  disabled={submitting}
                  placeholder="Selecciona fecha y hora"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="event-location" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Ubicación
                </label>
                <Input
                  id="event-location"
                  placeholder="Ciudad, recinto, dirección"
                  value={form.location}
                  onChange={handleChange('location')}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="event-description" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Descripción
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-black dark:text-white pointer-events-none" />
                  <textarea
                    id="event-description"
                    className="min-h-[120px] w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Notas generales, artistas, requisitos técnicos..."
                    value={form.description}
                    onChange={handleChange('description')}
                    disabled={submitting}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={submitting}
              >
                <X className="h-4 w-4 mr-2 text-black dark:text-white" />
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2 text-white" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Nombre del evento
              </label>
              <p className="text-base text-slate-900 dark:text-white">{event.name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Fecha y hora
              </label>
              <p className="text-base text-slate-900 dark:text-white">
                {new Date(event.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Ubicación
              </label>
              <p className="text-base text-slate-900 dark:text-white">{event.location || 'No especificada'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Descripción
              </label>
              <p className="text-base text-slate-900 dark:text-white whitespace-pre-wrap">
                {event.description || 'Sin descripción'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Tu rol
              </label>
              <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {event.userRole}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {canDelete && !isEditing && (
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Zona de peligro</CardTitle>
            <CardDescription>
              Eliminar este evento es una acción permanente que no se puede deshacer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2 text-white" />
                Eliminar evento
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  ¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2 text-white" />
                        Sí, eliminar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
