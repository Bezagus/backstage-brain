'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, Upload, Calendar, FileText, Bell, Star, ArrowUpRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useEvents } from "@/hooks/use-events"

export default function Home() {
  const { user } = useAuth()
  const { events, loading, error } = useEvents()
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bienvenido a Backstage Brain</h1>
            <p className="text-muted-foreground mt-1">Resumen general de tu evento y accesos rápidos.</p>
        </div>
        <Button variant="outline" className="hidden md:flex gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
        </Button>
      </div>
      
      {/* Event Summary Card */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-800">
        <CardHeader className="border-b border-slate-100 dark:border-zinc-800 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-black fill-black" />
            Resumen del evento
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 p-6 md:grid-cols-3">
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
            <span className="text-sm font-medium text-black dark:text-gray-300">Archivos subidos</span>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">24</span>
                <span className="text-xs text-muted-foreground">+4 hoy</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
            <span className="text-sm font-medium text-black dark:text-gray-300">Última actualización</span>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">10</span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">minutos</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
            <span className="text-sm font-medium text-black dark:text-gray-300">Próximos shows hoy</span>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">3</span>
                <span className="text-xs text-muted-foreground">Ver agenda</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Accesos Rápidos</h2>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Upload Card */}
        <Link href="/upload" className="group">
          <Card className="h-full overflow-hidden border-slate-200 dark:border-zinc-800 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 group-hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-2xl text-black dark:text-gray-300 group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-black dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl group-hover:text-black dark:group-hover:text-gray-300 transition-colors">Subir archivos</CardTitle>
                <CardDescription>Gestiona, organiza y comparte todos los documentos del evento.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Chat Card */}
        <Link href="/chat" className="group">
          <Card className="h-full overflow-hidden border-slate-200 dark:border-zinc-800 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 group-hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-2xl text-black dark:text-gray-300 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-black dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl group-hover:text-black dark:group-hover:text-gray-300 transition-colors">Chat inteligente</CardTitle>
                <CardDescription>Consulta al asistente de IA sobre detalles técnicos o logísticos.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Timeline Card */}
        <Link href="/timeline" className="group">
          <Card className="h-full overflow-hidden border-slate-200 dark:border-zinc-800 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 group-hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-2xl text-black dark:text-gray-300 group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-black dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl group-hover:text-black dark:group-hover:text-gray-300 transition-colors">Timeline del evento</CardTitle>
                <CardDescription>Visualiza horarios, ensayos y tareas clave en tiempo real.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Events Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Mis Eventos</h2>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {error && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && events.length === 0 && (
          <Card className="border-slate-200 dark:border-zinc-800">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No tienes eventos asignados
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Espera a que un administrador te invite a un evento.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="h-full border-slate-200 dark:border-zinc-800 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {new Date(event.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {event.userRole}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        📍 {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
