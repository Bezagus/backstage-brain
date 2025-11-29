'use client'

import { useEffect, useState } from 'react'
import { get, post } from '@/lib/api'
import { ChatMessage } from '@/lib/types'

interface UseChatReturn {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await get<{ messages: ChatMessage[] }>('/api/chat')
      setMessages(response.messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (message: string) => {
    try {
      const response = await post<{
        userMessage: ChatMessage
        assistantMessage: ChatMessage
        response: string
      }>('/api/chat', { message })

      // Add both messages to state
      setMessages((prev) => [...prev, response.userMessage, response.assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      console.error('Error sending message:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  }
}
