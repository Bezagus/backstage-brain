"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, FileText, Bot, User, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useChat } from "@/hooks/use-chat"
import { useEvents } from "@/hooks/use-events"

export default function ChatPage() {
  const { events, loading: eventsLoading } = useEvents()
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const { messages, loading, error, sendMessage } = useChat(selectedEventId || null)
  const [inputValue, setInputValue] = useState("")
  const [sending, setSending] = useState(false)

  // Set first event as selected when events load
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const messageToSend = inputValue
    setInputValue("")
    setSending(true)

    try {
      await sendMessage(messageToSend)
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Event Selection */}
      {eventsLoading ? (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : events.length === 0 ? (
        <Card className="border-slate-200 dark:border-zinc-800 mb-4">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">No tienes eventos disponibles.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Evento:</label>
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
      )}

      {!selectedEventId && events.length > 0 && (
        <Card className="border-slate-200 dark:border-zinc-800">
          <CardContent className="p-8 text-center">
            <Bot className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Selecciona un evento
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Por favor selecciona un evento para comenzar a chatear.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedEventId && (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-10">
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center text-black dark:text-gray-300">
                <Bot className="h-6 w-6" />
            </div>
            <div>
                <h2 className="font-bold text-slate-900 dark:text-white">AI Assistant</h2>
                <p className="text-xs text-black dark:text-gray-300 flex items-center gap-1">
                    <span className="block h-2 w-2 rounded-full bg-black dark:bg-gray-300 animate-pulse" />
                    Online
                </p>
            </div>
          </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6 bg-slate-50/50 dark:bg-zinc-950/50">
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Comienza una conversación
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pregunta sobre horarios, técnica o cualquier detalle del evento.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                 <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback className="bg-gray-100 text-black dark:bg-gray-200 dark:text-gray-900"><Bot className="h-4 w-4" /></AvatarFallback>
                 </Avatar>
              )}

              <div
                className={cn(
                  "max-w-[75%] px-5 py-3 text-sm shadow-sm",
                  message.role === "user"
                    ? "bg-black dark:bg-gray-900 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-zinc-800"
                )}
              >
                <p className="leading-relaxed">{message.content}</p>
                {message.file_id && message.event_files?.file_name && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-100/80 dark:bg-black/20 p-2.5 text-xs transition-colors hover:bg-slate-200/80 dark:hover:bg-black/40 cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-zinc-700">
                    <FileText className="h-4 w-4 text-black dark:text-gray-300 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{message.event_files.file_name}</span>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                 <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback className="bg-slate-200 text-slate-600"><User className="h-4 w-4" /></AvatarFallback>
                 </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
        <div className="relative flex items-center max-w-3xl mx-auto">
          <Input
            placeholder="Preguntá lo que necesites sobre el evento..."
            className="pr-14 py-6 pl-6 rounded-full bg-slate-100/50 dark:bg-zinc-800/50 border-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && handleSendMessage()}
            disabled={sending}
          />
          <Button
            size="icon"
            className={cn(
                "absolute right-2 h-10 w-10 rounded-full transition-all duration-200",
                inputValue.trim() && !sending ? "bg-black hover:bg-gray-900 dark:bg-gray-900 dark:hover:bg-black scale-100" : "bg-slate-300 cursor-not-allowed scale-90 opacity-70"
            )}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">Backstage Brain AI puede cometer errores. Verifica la información importante.</p>
        </div>
      </div>
        </div>
      )}
    </div>
  )
}