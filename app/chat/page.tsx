"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

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
    
    // Simulate response? No, requirements said "hardcoded as seen in images". 
    // But new messages won't trigger responses based on instructions.
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
      </div>

      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                )}
              >
                <p>{message.content}</p>
                {message.source && (
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-black/5 p-2 text-xs text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Fuente: {message.source}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4">
        <div className="relative">
          <Input
            placeholder="Preguntá lo que necesites... ej: ¿A que hora...?"
            className="pr-12 py-6 rounded-full shadow-sm border-muted-foreground/20"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            size="icon"
            className="absolute right-1 top-1 bottom-1 rounded-full h-auto aspect-square bg-blue-500 hover:bg-blue-600"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  )
}
