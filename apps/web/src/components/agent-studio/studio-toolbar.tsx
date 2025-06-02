"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Save, 
  Upload, 
  Download, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react"
import { useStudioStore } from "@/stores/studio-store"

export function StudioToolbar() {
  const { undo, redo, canUndo, canRedo } = useStudioStore()

  return (
    <div className="border-b bg-background p-2">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
        <Button size="sm" variant="ghost">
          <Upload className="h-4 w-4 mr-2" />
          Importar
        </Button>
        <Button size="sm" variant="ghost">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button size="sm" variant="ghost" onClick={undo} disabled={!canUndo()}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={redo} disabled={!canRedo()}>
          <RotateCw className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button size="sm" variant="ghost">
          <Play className="h-4 w-4 mr-2" />
          Executar
        </Button>
        <Button size="sm" variant="ghost">
          <Pause className="h-4 w-4 mr-2" />
          Pausar
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button size="sm" variant="ghost">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}