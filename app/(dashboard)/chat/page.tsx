"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, FileText, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  source?: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hola, soy tu asistente de IA de Backstage Brain. ¿En qué puedo ayudarte hoy?",
  },
  {
    id: 2,
    role: "user",
    content: "¿Cuál es la hora de inicio del evento principal?",
  },
  {
    id: 3,
    role: "assistant",
    content: "El evento principal comienza a las 20:00, según la agenda.",
    source: "AgendaGeneral.pdf",
  },
  {
    id: 4,
    role: "user",
    content: "¿Puedes darme más detalles sobre el stage principal?",
  },
  {
    id: 5,
    role: "assistant",
    content: "El stage principal cuenta con un sistema de sonido L-Acoustics K2 y un escenario de 15x10 metros. Puedes encontrar el rider técnico completo en el documento adjunto.",
    source: "RiderTecnicoStagePrincipal.docx",
  },
  {
    id: 6,
    role: "user",
    content: "¿Dónde puedo encontrar el listado de invitados VIP?",
  },
  {
    id: 7,
    role: "assistant",
    content: "El listado de invitados VIP está disponible en el archivo \"ListaVIP.xlsx\" en la sección de \"Gestión de Invitados\". Ten en cuenta que el acceso a este documento es restringido.",
    source: "ListaVIP.xlsx",
  },
  {
    id: 8,
    role: "user",
    content: "Entendido. ¿Algún cambio de último momento en el cronograma?",
  },
  {
    id: 9,
    role: "assistant",
    content: "Hasta el momento, no hay cambios de última hora en el cronograma oficial del evento.",
    source: "CronogramaFinal.pdf",
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    
    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputValue,
    }
    
    setMessages([...messages, newMessage])
    setInputValue("")
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
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
                {message.source && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-100/80 dark:bg-black/20 p-2.5 text-xs transition-colors hover:bg-slate-200/80 dark:hover:bg-black/40 cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-zinc-700">
                    <FileText className="h-4 w-4 text-black dark:text-gray-300 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{message.source}</span>
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
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            size="icon"
            className={cn(
                "absolute right-2 h-10 w-10 rounded-full transition-all duration-200",
                inputValue.trim() ? "bg-black hover:bg-gray-900 dark:bg-gray-900 dark:hover:bg-black scale-100" : "bg-slate-300 cursor-not-allowed scale-90 opacity-70"
            )}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">Backstage Brain AI puede cometer errores. Verifica la información importante.</p>
        </div>
      </div>
    </div>
  )
}