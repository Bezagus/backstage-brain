import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CloudUpload, FileText, Image as ImageIcon, File, FileSpreadsheet } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const categories = ["Horarios", "Técnica", "Legales", "Personal", "Marketing"]

const uploadedFiles = [
  {
    id: 1,
    name: "Agenda_Evento_2024.pdf",
    category: "Horarios",
    date: "29 Nov, 10:30",
    size: "2.4 MB",
    type: "pdf",
  },
  {
    id: 2,
    name: "Plano_Escenario_Principal.jpg",
    category: "Técnica",
    date: "28 Nov, 16:45",
    size: "5.1 MB",
    type: "image",
  },
  {
    id: 3,
    name: "Contrato_Proveedor_Audio.docx",
    category: "Legales",
    date: "28 Nov, 09:15",
    size: "850 KB",
    type: "doc",
  },
  {
    id: 4,
    name: "Lista_Personal_Staff.xlsx",
    category: "Personal",
    date: "27 Nov, 14:20",
    size: "1.2 MB",
    type: "sheet",
  },
  {
    id: 5,
    name: "Briefing_Marketing.pdf",
    category: "Marketing",
    date: "27 Nov, 11:00",
    size: "3.8 MB",
    type: "pdf",
  },
]

const getFileIcon = (type: string) => {
    switch(type) {
        case 'image': return <ImageIcon className="h-6 w-6 text-gray-600" />;
        case 'sheet': return <FileSpreadsheet className="h-6 w-6 text-gray-600" />;
        case 'doc': return <FileText className="h-6 w-6 text-gray-600" />;
        case 'pdf': return <File className="h-6 w-6 text-gray-600" />;
        default: return <File className="h-6 w-6 text-gray-600" />;
    }
}

const getFileBg = (type: string) => {
    switch(type) {
        case 'image': return 'bg-gray-100 dark:bg-gray-900/30';
        case 'sheet': return 'bg-gray-100 dark:bg-gray-900/30';
        case 'doc': return 'bg-gray-100 dark:bg-gray-900/30';
        case 'pdf': return 'bg-gray-100 dark:bg-gray-900/30';
        default: return 'bg-gray-100 dark:bg-gray-800';
    }
}

export default function UploadPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Centro de Carga</h1>
            <p className="text-muted-foreground mt-1">Gestiona y organiza todos los archivos de tu evento.</p>
          </div>
          <Button>
            <CloudUpload className="mr-2 h-4 w-4" /> Subir Nuevo
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Dropzone & Filters */}
          <div className="md:col-span-1 space-y-6">
             {/* Drag and Drop Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl p-8 text-center bg-gray-50/50 dark:bg-gray-900/10 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors cursor-pointer group">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <CloudUpload className="h-8 w-8 text-gray-500" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Arrastra archivos</h3>
                        <p className="text-xs text-muted-foreground">o haz clic para explorar</p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Filtrar por etiqueta</h3>
                <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">
                    {cat}
                    </Badge>
                ))}
                </div>
            </div>
          </div>

          {/* Right Column: File List */}
          <div className="md:col-span-2">
             <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Archivos Recientes</h3>
                    <span className="text-xs text-muted-foreground">Total: 5 archivos</span>
                </div>
                <ScrollArea className="h-[500px]">
                    <div className="p-2 space-y-1">
                    {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center p-3 gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group cursor-pointer">
                            <div className={`p-3 rounded-xl ${getFileBg(file.type)}`}>
                                {getFileIcon(file.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-600 transition-colors">
                                    {file.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                    <span>{file.size}</span>
                                    <span>•</span>
                                    <span>{file.date}</span>
                                </div>
                            </div>

                            <Badge variant="outline" className="hidden sm:inline-flex border-gray-200 dark:border-zinc-700 text-gray-500 font-normal">
                                {file.category}
                            </Badge>
                            
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                                <FileText className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
             </div>
          </div>
      </div>
    </div>
  )
}