import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as apiGet, postFormData } from '@/lib/api'
import type { EventFile } from '@/lib/types'

interface UploadState {
  files: EventFile[]
  loading: boolean
  uploading: boolean
  error: string | null
  setUploading: (uploading: boolean) => void
  fetchFiles: (eventId: string) => Promise<void>
  handleUpload: (eventId: string, file: File, category: string) => Promise<void>
  clearError: () => void
}

export const useUploadStore = create<UploadState>()(
  persist(
    (set, get) => ({
      files: [],
      loading: false,
      uploading: false,
      error: null,
      setUploading: (uploading) => set({ uploading }),
      fetchFiles: async (eventId) => {
        if (!eventId) return

        set({ loading: true, error: null })
        try {
          const response = await apiGet<{ files: EventFile[] }>(`/api/events/${eventId}/files`)
          set({ files: response.files, loading: false })
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Error al cargar archivos', loading: false })
        }
      },
      handleUpload: async (eventId, file, category) => {
        if (!eventId) {
          set({ error: 'Por favor selecciona un evento primero' })
          return
        }

        set({ uploading: true, error: null })

        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('category', category)

          await postFormData(`/api/events/${eventId}/upload`, formData)

          // Refresh file list by calling fetchFiles
          await get().fetchFiles(eventId)
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Error al subir archivo' })
        } finally {
          set({ uploading: false })
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'upload-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ files: state.files }),
    }
  )
)

