import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, Upload, Calendar } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Bienvenido a Backstage Brain</h1>
      
      {/* Event Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del evento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Archivos subidos:</span>
            <span className="font-medium">24</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Última actualización:</span>
            <span className="font-medium">Hace 10 min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Próximos shows hoy:</span>
            <span className="font-medium">3</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Upload Card */}
        <Link href="/upload">
          <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Upload className="h-6 w-6" />
              </div>
              <div className="grid gap-1">
                <CardTitle className="text-lg">Subir archivos</CardTitle>
                <CardDescription>Gestiona todos tus archivos del evento.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Chat Card */}
        <Link href="/chat">
          <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="grid gap-1">
                <CardTitle className="text-lg">Chat inteligente</CardTitle>
                <CardDescription>Consulta al asistente de IA del evento.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Timeline Card */}
        <Link href="/timeline">
          <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="grid gap-1">
                <CardTitle className="text-lg">Timeline del evento</CardTitle>
                <CardDescription>Visualiza horarios y tareas clave.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}