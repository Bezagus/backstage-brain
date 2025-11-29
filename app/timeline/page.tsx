import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const events = [
  {
    id: 1,
    title: "Ensayo General Banda Principal",
    time: "18:00 - 19:30",
    location: "Escenario Principal",
  },
  {
    id: 2,
    title: "Prueba de Sonido DJ Set",
    time: "19:30 - 20:00",
    location: "Área Electrónica",
  },
  {
    id: 3,
    title: "Apertura de Puertas al Público",
    time: "20:00",
    location: "Entrada Principal",
  },
  {
    id: 4,
    title: "Performance de Apertura: Artista Local",
    time: "20:30 - 21:00",
    location: "Escenario Secundario",
  },
  {
    id: 5,
    title: "Charla con el Director del Evento sobre Logística",
    time: "21:00 - 21:30",
    location: "Sala de Conferencias",
  }
]

export default function TimelinePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-4">
        {/* Back button mock (optional, since sidebar exists) */}
        <h1 className="text-2xl font-bold">Cronograma del Evento</h1>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                 <MapPin className="h-4 w-4 text-muted-foreground" />
                 <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-normal">
                    {event.location}
                 </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
