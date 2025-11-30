import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { post, get as apiGet } from '@/lib/api'
import type { Message } from '@/lib/types'

interface ChatState {
  messagesByEvent: { [eventId: string]: Message[] }
  loading: boolean
  error: string | null
  lastUsedEventId: string | null
  setLastUsedEventId: (eventId: string) => void
  sendMessage: (eventId: string, content: string) => Promise<void>
  fetchMessages: (eventId: string) => Promise<void>
  clearError: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messagesByEvent: {},
      loading: false,
      error: null,
      lastUsedEventId: null,
      setLastUsedEventId: (eventId) => set({ lastUsedEventId: eventId }),
      fetchMessages: async (eventId) => {
        if (!eventId) return
        set({ loading: true, error: null })
        try {
          const response = await apiGet<{ messages: Message[] }>(`/api/events/${eventId}/chat`)
          set((state) => ({
            messagesByEvent: {
              ...state.messagesByEvent,
              [eventId]: response.messages,
            },
            loading: false,
          }))
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch messages',
            loading: false,
          })
        }
      },
      sendMessage: async (eventId, content) => {
        if (!eventId) {
          set({ error: 'Event ID is missing.' })
          return
        }

        // @ts-expect-error
        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          content,
          role: 'user',
          event_id: eventId,
        }

        set((state) => ({
          messagesByEvent: {
            ...state.messagesByEvent,
            [eventId]: [...(state.messagesByEvent[eventId] || []), userMessage],
          },
          error: null,
        }))

        try {
          const response = await post<{
            userMessage: Message
            assistantMessage: Message
          }>(`/api/events/${eventId}/chat`, {
            message: content,
          })

          set((state) => {
            const eventMessages = state.messagesByEvent[eventId] || []
            const updatedMessages = eventMessages.filter((m) => m.id !== userMessage.id)
            return {
              messagesByEvent: {
                ...state.messagesByEvent,
                [eventId]: [...updatedMessages, response.userMessage, response.assistantMessage],
              },
            }
          })
        } catch (err) {
          set((state) => {
            const eventMessages = state.messagesByEvent[eventId] || []
            return {
              error: err instanceof Error ? err.message : 'Failed to send message',
              messagesByEvent: {
                ...state.messagesByEvent,
                [eventId]: eventMessages.filter((m) => m.id !== userMessage.id),
              },
            }
          })
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => {
        const slicedMessages: { [eventId: string]: Message[] } = {}
        for (const eventId in state.messagesByEvent) {
          slicedMessages[eventId] = state.messagesByEvent[eventId].slice(-20)
        }
        return { messagesByEvent: slicedMessages, lastUsedEventId: state.lastUsedEventId }
      },
    }
  )
)
