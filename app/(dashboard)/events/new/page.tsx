'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarPlus, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { post } from '@/lib/api'
import type { Event, UserRole } from '@/lib/types'

type CreatedEvent = Event & { userRole: UserRole }

interface CreateEventResponse {
  event: CreatedEvent
}

export default function NewEventPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdEvent, setCreatedEvent] = useState<CreatedEvent | null>(null)

  const handleChange = (
    field: keyof typeof form,
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim() || !form.date || !form.location.trim()) {
      setError('Completa el nombre, la fecha y la ubicación del evento')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await post<CreateEventResponse>('/api/events', {
        name: form.name.trim(),
        date: form.date,
        location: form.location.trim(),
        description: form.description.trim() || null,
      })

      setCreatedEvent(response.event)
      setSuccess('Evento creado correctamente. Puedes comenzar a subir archivos.')
      setForm({
        name: '',
        date: '',
        location: '',
        description: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el evento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoToUploads = () => {
    router.push('/upload')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <CalendarPlus className="h-4 w-4" />
            Nuevo evento
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            Crear evento
          </h1>
          <p className="text-muted-foreground mt-1">
            Registra un nuevo evento para habilitar el centro de carga y la línea de tiempo.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>
      </div>

      <Card className="border-slate-200 dark:border-zinc-800 shadow-lg">
        <CardHeader>
          <CardTitle>Detalles del evento</CardTitle>
          <CardDescription>
            Completa la información principal del evento. Podrás editarla más adelante.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="event-name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Nombre del evento
              </label>
              <Input
                id="event-name"
                placeholder="Ej. Festival Backstage 2025"
                value={form.name}
                onChange={handleChange('name')}
                disabled={submitting}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="event-date" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Fecha y hora
                </label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={form.date}
                  onChange={handleChange('date')}
                  disabled={submitting}
                  required
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
            </div>

            <div className="space-y-2">
              <label htmlFor="event-description" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Descripción
              </label>
              <textarea
                id="event-description"
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Notas generales, artistas, requisitos técnicos..."
                value={form.description}
                onChange={handleChange('description')}
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {success}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {createdEvent ? (
              <p className="text-sm text-muted-foreground">
                Evento <span className="font-semibold text-slate-900 dark:text-white">{createdEvent.name}</span> listo para usar.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarPlus className="h-4 w-4" />
                Esta información se mostrará en el panel y en la línea de tiempo.
              </p>
            )}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              {createdEvent && (
                <Button type="button" variant="outline" onClick={handleGoToUploads}>
                  Ir a subir archivos
                </Button>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear evento'
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


