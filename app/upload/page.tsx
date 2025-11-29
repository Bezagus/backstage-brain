import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CloudUpload, FileText, Image as ImageIcon } from "lucide-react"

const categories = ["Horarios", "Técnica", "Legales", "Personal"]

const uploadedFiles = [
  {
    id: 1,
    name: "Agenda_Evento_2024.pdf",
    category: "Horarios",
    date: "2024-...",
    type: "pdf",
  },
  {
    id: 2,
    name: "Plano_Escenario_Principal.jpg",
    category: "Técnica",
    date: "2024-...",
    type: "image",
  },
  {
    id: 3,
    name: "Contrato_Proveedor_Audio.docx",
    category: "Legales",
    date: "2024-...",
    type: "doc",
  },
  {
    id: 4,
    name: "Lista_Personal_Staff.xlsx",
    category: "Personal",
    date: "2024-...",
    type: "sheet",
  },
  {
    id: 5,
    name: "Briefing_Marketing.pdf",
    category: "Marketing",
    date: "2024-...",
    type: "pdf",
  },
]

export default function UploadPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Centro de Carga de Archivos</h1>
      </div>

      {/* Drag and Drop Area */}
      <div className="border-2 border-dashed rounded-lg p-10 text-center bg-muted/10 hover:bg-muted/20 transition-colors">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-blue-50 rounded-full">
            <CloudUpload className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold">Arrastra y suelta tus archivos aquí</h3>
          <p className="text-sm text-muted-foreground">PDF, DOCX, JPG, PNG</p>
        </div>
      </div>

      <Button variant="outline" className="w-full h-12 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
        Seleccionar archivo
      </Button>

      {/* Categories */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Etiquetas de Categoría</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 text-sm font-normal">
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Uploaded Files List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Archivos Cargados</h3>
        <div className="grid gap-3">
          {uploadedFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="flex items-center p-4 gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                   {/* Icon based on simple logic for demo */}
                   <FileText className="h-5 w-5 text-gray-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                </div>

                <Badge variant="secondary" className="bg-gray-100 text-gray-800 font-normal hidden sm:inline-flex">
                  {file.category}
                </Badge>
                
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {file.date}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
