'use client'

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CloudUpload, FileText, Image as ImageIcon, File, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEvents } from "@/hooks/use-events"
import { get, postFormData } from "@/lib/api"
import type { EventFile } from "@/lib/types"

const categories = ["Horarios", "Técnica", "Legales", "Personal", "Marketing"]

const getFileIcon = (type: string) => {
    switch(type) {
        case 'image': return <ImageIcon className="h-6 w-6 text-gray-600" />;
        case 'sheet': return <FileSpreadsheet className="h-6 w-6 text-gray-600" />;
        case 'doc': return <FileText className="h-6 w-6 text-gray-600" />;
        case 'pdf': return <File className="h-6 w-6 text-gray-600" />;
        default: return <File className="h-6 w-6 text-gray-600" />;
    }
}

const getFileBg = (type: string) => {
    switch(type) {
        case 'image': return 'bg-gray-100 dark:bg-gray-900/30';
        case 'sheet': return 'bg-gray-100 dark:bg-gray-900/30';
        case 'doc': return 'bg-gray-100 dark:bg-gray-900/30';
        case 'pdf': return 'bg-gray-100 dark:bg-gray-900/30';
        default: return 'bg-gray-100 dark:bg-gray-800';
    }
}

export default function UploadPage() {
  const { events, loading: eventsLoading } = useEvents()
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [files, setFiles] = useState<EventFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Horarios')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set first event as selected when events load
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId])

  // Fetch files when event is selected
  useEffect(() => {
    if (selectedEventId) {
      fetchFiles()
    }
  }, [selectedEventId])

  const fetchFiles = async () => {
    if (!selectedEventId) return

    setLoading(true)
    setError('')
    try {
      const response = await get<{ files: EventFile[] }>(`/api/events/${selectedEventId}/files`)
      setFiles(response.files)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar archivos')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleUpload = async (file: File) => {
    if (!selectedEventId) {
      setError('Por favor selecciona un evento primero')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', selectedCategory)

      await postFormData(`/api/events/${selectedEventId}/upload`, formData)

      // Refresh file list
      await fetchFiles()

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      const file = droppedFiles[0]
      handleUpload(file)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Centro de Carga</h1>
            <p className="text-muted-foreground mt-1">Gestiona y organiza todos los archivos de tu evento.</p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} disabled={!selectedEventId || uploading}>
            {uploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</>
            ) : (
              <><CloudUpload className="mr-2 h-4 w-4" /> Subir Nuevo</>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt"
            onChange={handleFileSelect}
          />
      </div>

      {/* Event Selection */}
      {eventsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : events.length === 0 ? (
        <Card className="border-slate-200 dark:border-zinc-800">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-slate-600 dark:text-slate-400">No tienes eventos disponibles.</p>
            <p className="text-sm text-muted-foreground">
              Crea un evento para habilitar el centro de carga y asignar archivos.
            </p>
            <Button asChild>
              <Link href="/events/new">Crear mi primer evento</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Dropzone & Filters */}
          <div className="md:col-span-1 space-y-6">
             {/* Drag and Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group ${
                isDragging
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 hover:bg-gray-50 dark:hover:bg-gray-900/20'
              }`}
            >
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {uploading ? (
                          <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />
                        ) : (
                          <CloudUpload className="h-8 w-8 text-gray-500" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {uploading ? 'Subiendo...' : 'Arrastra archivos'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {uploading ? 'Por favor espera' : 'o haz clic para explorar (PDF/TXT)'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Categoría para subida</h3>
                <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      onClick={() => setSelectedCategory(cat)}
                      className={`bg-white dark:bg-zinc-900 border hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer px-3 py-1.5 text-sm font-medium ${
                        selectedCategory === cat
                          ? 'border-black dark:border-white text-black dark:text-white'
                          : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {cat}
                    </Badge>
                ))}
                </div>
            </div>
          </div>

          {/* Right Column: File List */}
          <div className="md:col-span-2">
             <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Archivos Recientes</h3>
                    <span className="text-xs text-muted-foreground">Total: {files.length} archivos</span>
                </div>
                <ScrollArea className="h-[500px]">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : files.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          No hay archivos
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Sube tu primer archivo para comenzar.
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {files.map((file) => (
                          <div key={file.id} className="flex items-center p-3 gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group cursor-pointer">
                              <div className={`p-3 rounded-xl ${getFileBg(file.file_type.includes('pdf') ? 'pdf' : 'doc')}`}>
                                  {getFileIcon(file.file_type.includes('pdf') ? 'pdf' : 'doc')}
                              </div>

                              <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-600 transition-colors">
                                      {file.file_name}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                      <span>{formatFileSize(file.file_size)}</span>
                                      <span>•</span>
                                      <span>{formatDate(file.uploaded_at)}</span>
                                  </div>
                              </div>

                              <Badge variant="outline" className="hidden sm:inline-flex border-gray-200 dark:border-zinc-700 text-gray-500 font-normal">
                                  {file.category}
                              </Badge>

                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                                  <FileText className="h-4 w-4" />
                              </Button>
                          </div>
                        ))}
                      </div>
                    )}
                </ScrollArea>
             </div>
          </div>
      </div>
    </div>
  )
}