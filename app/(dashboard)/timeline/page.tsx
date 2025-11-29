import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Music, Users, DoorOpen, FileCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const events = [
  {
    id: 1,
    title: "Ensayo General Banda Principal",
    time: "18:00 - 19:30",
    location: "Escenario Principal",
    type: "rehearsal",
    icon: Music,
  },
  {
    id: 2,
    title: "Prueba de Sonido DJ Set",
    time: "19:30 - 20:00",
    location: "Área Electrónica",
    type: "soundcheck",
    icon: Users,
  },
  {
    id: 3,
    title: "Apertura de Puertas al Público",
    time: "20:00",
    location: "Entrada Principal",
    type: "logistics",
    icon: DoorOpen,
  },
  {
    id: 4,
    title: "Performance de Apertura: Artista Local",
    time: "20:30 - 21:00",
    location: "Escenario Secundario",
    type: "show",
    icon: Music,
  },
  {
    id: 5,
    title: "Charla con el Director del Evento",
    time: "21:00 - 21:30",
    location: "Sala de Conferencias",
    type: "meeting",
    icon: FileCheck,
  }
]

const getTypeColor = (type: string) => {
    switch(type) {
        case 'rehearsal': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'soundcheck': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'logistics': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'show': return 'bg-gray-100 text-gray-600 border-gray-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
}

const getTypeDot = (type: string) => {
    switch(type) {
        case 'rehearsal': return 'bg-gray-500';
        case 'soundcheck': return 'bg-gray-500';
        case 'logistics': return 'bg-gray-500';
        case 'show': return 'bg-gray-500';
        default: return 'bg-gray-500';
    }
}

export default function TimelinePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cronograma del Evento</h1>
        <Badge variant="outline" className="px-3 py-1 text-sm">Hoy, 29 Nov</Badge>
      </div>

      <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-3.5 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-zinc-800">
        {events.map((event) => (
          <div key={event.id} className="relative">
             {/* Dot on timeline */}
            <div className={cn(
                "absolute -left-[34px] mt-1.5 h-4 w-4 rounded-full border-4 border-white dark:border-zinc-950 shadow-sm",
                getTypeDot(event.type)
            )} />
            
            <Card className="hover:shadow-md transition-shadow duration-200 border-gray-200 dark:border-zinc-800">
              <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Time & Icon Box */}
                <div className={cn(
                    "flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl border",
                    getTypeColor(event.type)
                )}>
                    <event.icon className="h-6 w-6 mb-1" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="h-6 font-mono text-xs tracking-wider">
                            {event.time}
                        </Badge>
                        {/* Optional status badge could go here */}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                        {event.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}