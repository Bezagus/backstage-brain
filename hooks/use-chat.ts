'use client'

import { useEffect, useState } from 'react'
import { get, post, supabase } from '@/lib/api'
import { ChatMessage } from '@/lib/types'

interface UseChatReturn {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useChat(eventId: string | null): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    if (!eventId) {
      setMessages([])
      setLoading(false)
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

      const response = await get<{ messages: ChatMessage[] }>(`/api/events/${eventId}/chat`)
      setMessages(response.messages)
    } catch (err) {
      // Only log error if it's not an auth issue
      if (err instanceof Error && !err.message.includes('Auth session')) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages')
        console.error('Error fetching messages:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (message: string) => {
    if (!eventId) {
      throw new Error('Event ID is required')
    }

    // Check if user is authenticated before making API call
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Auth session missing')
    }

    try {
      const response = await fetch(`/api/events/${eventId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Chat API error:', response.status, errorText)
        throw new Error(`Failed to send message: ${response.status} ${errorText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      let assistantMessageContent = ''
      let assistantMessageId = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'user_message') {
              // Add user message immediately
              setMessages((prev) => [...prev, data.message])
            } else if (data.type === 'chunk') {
              // Accumulate assistant message chunks
              assistantMessageContent += data.text

              // Update or add assistant message in real-time
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1]
                if (lastMessage?.role === 'assistant' && !assistantMessageId) {
                  // Update existing streaming message
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: assistantMessageContent }
                  ]
                } else {
                  // Add new streaming message
                  return [
                    ...prev,
                    {
                      id: 'streaming',
                      user_id: session.user.id,
                      role: 'assistant' as const,
                      content: assistantMessageContent,
                      source_file_id: null,
                      source_document_name: null,
                      created_at: new Date().toISOString()
                    }
                  ]
                }
              })
            } else if (data.type === 'done') {
              // Replace streaming message with final message
              assistantMessageId = data.message.id
              setMessages((prev) => {
                const withoutStreaming = prev.filter(m => m.id !== 'streaming')
                return [...withoutStreaming, data.message]
              })
            }
          }
        }
      }
    } catch (err) {
      // Only log error if it's not an auth issue
      if (err instanceof Error && !err.message.includes('Auth session')) {
        setError(err instanceof Error ? err.message : 'Failed to send message')
        console.error('Error sending message:', err)
      }
      throw err
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [eventId])

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  }
}
