'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { generateExcelData, downloadExcel } from '@/lib/excel-exporter'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  session: {
    id: string
    clientName: string
    photographer: string
    date: string
    location: string
  }
  photos: Array<{
    id: string
    filename?: string
    rating: number
    isFavorite: boolean
    colorTag: string | null
    comments: string
    isReviewed: boolean
  }>
}

export function ExportDialog({ isOpen, onClose, session, photos }: ExportDialogProps) {
  const [includeExtension, setIncludeExtension] = useState(true)
  const [changeExtension, setChangeExtension] = useState('')
  const [outputFormat, setOutputFormat] = useState<'column' | 'text'>('column')
  const [customFilename, setCustomFilename] = useState('')

  const handleExport = () => {
    const options = {
      includeExtension,
      changeExtension: changeExtension || undefined,
      outputFormat
    }

    const data = generateExcelData(session, photos, options)
    
    const filename = customFilename || 
      `reporte_${session.clientName}_${new Date().toISOString().split('T')[0]}.csv`

    downloadExcel(data, filename)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar a Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nombre del archivo */}
          <div className="space-y-2">
            <Label htmlFor="filename">Nombre del archivo</Label>
            <Input
              id="filename"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={`reporte_${session.clientName}_${new Date().toISOString().split('T')[0]}.csv`}
            />
          </div>

          {/* Opciones de extensión */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-extension"
                checked={includeExtension}
                onCheckedChange={(checked) => setIncludeExtension(checked as boolean)}
              />
              <Label htmlFor="include-extension">
                Incluir extensión de archivos (.jpg, .png, etc.)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="change-extension">Cambiar extensión (opcional)</Label>
              <Input
                id="change-extension"
                value={changeExtension}
                onChange={(e) => setChangeExtension(e.target.value)}
                placeholder="Ej: jpg, png, tiff"
              />
              <p className="text-xs text-muted-foreground">
                Si especificas una extensión, se cambiará para todos los archivos
              </p>
            </div>
          </div>

          {/* Formato de salida */}
          <div className="space-y-2">
            <Label htmlFor="output-format">Formato de listado de archivos</Label>
            <Select value={outputFormat} onValueChange={(value: 'column' | 'text') => setOutputFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="column">Columnas separadas (recomendado)</SelectItem>
                <SelectItem value="text">Texto separado por espacios</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {outputFormat === 'column' 
                ? 'Cada dato en una columna separada, fácil de filtrar' 
                : 'Nombres de archivos en una sola celda separados por espacios'}
            </p>
          </div>

          {/* Vista previa */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">Vista previa:</p>
            <div className="text-xs space-y-1">
              <p>• Información de la sesión</p>
              <p>• Estadísticas generales</p>
              <p>• Fotos seleccionadas ({photos.filter(p => p.colorTag === 'green').length})</p>
              <p>• Fotos favoritas ({photos.filter(p => p.isFavorite).length})</p>
              <p>• Fotos para revisar ({photos.filter(p => p.colorTag === 'yellow').length})</p>
              <p>• Fotos para descartar ({photos.filter(p => p.colorTag === 'red').length})</p>
              <p>• Listado completo ({photos.length} fotos)</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport}>
            Exportar Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 