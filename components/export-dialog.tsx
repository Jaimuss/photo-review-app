'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { generateExcelData, downloadExcel } from '@/lib/excel-exporter'
import { Copy, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

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
  const [exportType, setExportType] = useState<'excel' | 'txt' | 'copy'>('excel')
  const [photoFilter, setPhotoFilter] = useState<'all' | '5stars' | 'favorites' | 'selected' | 'reviewed'>('all')

  const filterPhotos = () => {
    switch (photoFilter) {
      case '5stars':
        return photos.filter(p => p.rating === 5)
      case 'favorites':
        return photos.filter(p => p.isFavorite)
      case 'selected':
        return photos.filter(p => p.colorTag === 'green')
      case 'reviewed':
        return photos.filter(p => p.isReviewed)
      default:
        return photos
    }
  }

  const handleExport = async () => {
    const filteredPhotos = filterPhotos()
    
    const options = {
      includeExtension,
      changeExtension: changeExtension || undefined,
      outputFormat
    }

    const data = generateExcelData(session, filteredPhotos, options)
    
    if (exportType === 'copy') {
      // Generar texto para copiar
      const textData = data.map(row => row.join('\t')).join('\n')
      try {
        await navigator.clipboard.writeText(textData)
        toast({
          title: "¡Copiado!",
          description: "Los datos se han copiado al portapapeles",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo copiar al portapapeles",
          variant: "destructive",
        })
      }
    } else {
      const fileExtension = exportType === 'excel' ? 'xlsx' : 'txt'
      const filename = customFilename || 
        `reporte_${session.clientName}_${new Date().toISOString().split('T')[0]}.${fileExtension}`

      downloadExcel(data, filename)
      
      toast({
        title: "¡Exportado!",
        description: `Archivo ${exportType.toUpperCase()} descargado correctamente`,
      })
    }
    
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Exportar Datos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de exportación */}
          <div className="space-y-3">
            <Label>Tipo de exportación</Label>
            <RadioGroup value={exportType} onValueChange={(value: 'excel' | 'txt' | 'copy') => setExportType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel (.xlsx)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="txt" id="txt" />
                <Label htmlFor="txt" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Archivo de texto (.txt)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="copy" id="copy" />
                <Label htmlFor="copy" className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copiar al portapapeles
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Filtro de fotos */}
          <div className="space-y-2">
            <Label htmlFor="photo-filter">¿Qué fotos exportar?</Label>
            <Select value={photoFilter} onValueChange={(value: 'all' | '5stars' | 'favorites' | 'selected' | 'reviewed') => setPhotoFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fotos ({photos.length})</SelectItem>
                <SelectItem value="5stars">Solo 5 estrellas ({photos.filter(p => p.rating === 5).length})</SelectItem>
                <SelectItem value="favorites">Solo favoritas ({photos.filter(p => p.isFavorite).length})</SelectItem>
                <SelectItem value="selected">Solo seleccionadas ({photos.filter(p => p.colorTag === 'green').length})</SelectItem>
                <SelectItem value="reviewed">Solo revisadas ({photos.filter(p => p.isReviewed).length})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nombre del archivo */}
          {exportType !== 'copy' && (
            <div className="space-y-2">
              <Label htmlFor="filename">Nombre del archivo</Label>
              <Input
                id="filename"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder={`reporte_${session.clientName}_${new Date().toISOString().split('T')[0]}.${exportType === 'excel' ? 'xlsx' : 'txt'}`}
              />
            </div>
          )}

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
              <p>• Se exportarán <strong>{filterPhotos().length} fotos</strong> ({
                photoFilter === 'all' ? 'todas' :
                photoFilter === '5stars' ? 'solo 5 estrellas' :
                photoFilter === 'favorites' ? 'solo favoritas' :
                photoFilter === 'selected' ? 'solo seleccionadas' :
                'solo revisadas'
              })</p>
              <p>• Formato: <strong>{
                exportType === 'excel' ? 'Excel (.xlsx)' :
                exportType === 'txt' ? 'Archivo de texto (.txt)' :
                'Copiar al portapapeles'
              }</strong></p>
              {outputFormat === 'text' && (
                <p>• Los archivos se listarán separados por espacios</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport} className="gap-2">
            {exportType === 'excel' ? <FileSpreadsheet className="w-4 h-4" /> :
             exportType === 'txt' ? <FileText className="w-4 h-4" /> :
             <Copy className="w-4 h-4" />}
            {exportType === 'excel' ? 'Exportar Excel' :
             exportType === 'txt' ? 'Exportar TXT' :
             'Copiar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 