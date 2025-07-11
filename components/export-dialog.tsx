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
import { Copy, FileSpreadsheet, FileText, X, Star, Heart } from 'lucide-react'
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
  
  // Filtros avanzados
  const [selectedRatings, setSelectedRatings] = useState<number[]>([0, 1, 2, 3, 4, 5]) // Por defecto todas
  const [includeFavorites, setIncludeFavorites] = useState<boolean | null>(null) // null = ambas, true = solo favoritas, false = solo no favoritas
  const [includeColorTags, setIncludeColorTags] = useState<{
    green: boolean    // Seleccionadas
    yellow: boolean   // Revisar  
    red: boolean      // Descartar
    none: boolean     // Sin etiqueta
  }>({
    green: true,
    yellow: true, 
    red: true,
    none: true
  })
  const [includeReviewed, setIncludeReviewed] = useState<boolean | null>(null) // null = ambas

  const filterPhotos = () => {
    return photos.filter(photo => {
      // Filtro por rating
      if (!selectedRatings.includes(photo.rating)) {
        return false
      }
      
      // Filtro por favoritas
      if (includeFavorites !== null) {
        if (includeFavorites && !photo.isFavorite) return false
        if (!includeFavorites && photo.isFavorite) return false
      }
      
      // Filtro por etiquetas de color
      if (photo.colorTag === 'green' && !includeColorTags.green) return false
      if (photo.colorTag === 'yellow' && !includeColorTags.yellow) return false  
      if (photo.colorTag === 'red' && !includeColorTags.red) return false
      if (!photo.colorTag && !includeColorTags.none) return false
      
      // Filtro por revisadas
      if (includeReviewed !== null) {
        if (includeReviewed && !photo.isReviewed) return false
        if (!includeReviewed && photo.isReviewed) return false
      }
      
      return true
    })
  }

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating)
        : [...prev, rating].sort((a, b) => a - b)
    )
  }

  const toggleAllRatings = () => {
    if (selectedRatings.length === 6) {
      setSelectedRatings([])
    } else {
      setSelectedRatings([0, 1, 2, 3, 4, 5])
    }
  }

  const resetFilters = () => {
    setSelectedRatings([0, 1, 2, 3, 4, 5])
    setIncludeFavorites(null)
    setIncludeColorTags({ green: true, yellow: true, red: true, none: true })
    setIncludeReviewed(null)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar Fotos con Filtros Avanzados</DialogTitle>
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

          {/* Filtros avanzados de fotos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Filtros de Exportación</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters}
                  className="text-xs"
                >
                  Restablecer
                </Button>
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="space-y-2">
              <Label className="font-medium text-sm">Filtros rápidos:</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    setSelectedRatings([5])
                    setIncludeFavorites(null)
                    setIncludeColorTags({ green: true, yellow: true, red: true, none: true })
                    setIncludeReviewed(null)
                  }}
                >
                  Solo 5★
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    setSelectedRatings([3, 4, 5])
                    setIncludeFavorites(null)
                    setIncludeColorTags({ green: true, yellow: true, red: true, none: true })
                    setIncludeReviewed(null)
                  }}
                >
                  3★, 4★ y 5★
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    setSelectedRatings([0, 1, 2, 3, 4, 5])
                    setIncludeFavorites(null)
                    setIncludeColorTags({ green: true, yellow: false, red: false, none: false })
                    setIncludeReviewed(null)
                  }}
                >
                  Solo seleccionadas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    setSelectedRatings([0, 1, 2, 3, 4, 5])
                    setIncludeFavorites(true)
                    setIncludeColorTags({ green: true, yellow: true, red: true, none: true })
                    setIncludeReviewed(null)
                  }}
                >
                  Solo favoritas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    setSelectedRatings([4, 5])
                    setIncludeFavorites(null)
                    setIncludeColorTags({ green: true, yellow: false, red: false, none: false })
                    setIncludeReviewed(null)
                  }}
                >
                  4★-5★ + Seleccionadas
                </Button>
              </div>
            </div>

            {/* Filtro por estrellas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Rating (estrellas)</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleAllRatings}
                  className="text-xs h-6 px-2"
                >
                  {selectedRatings.length === 6 ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2, 3, 4, 5].map(rating => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={selectedRatings.includes(rating)}
                      onCheckedChange={() => toggleRating(rating)}
                    />
                    <Label htmlFor={`rating-${rating}`} className="text-sm flex items-center gap-1">
                      {rating === 0 ? (
                        <span className="flex items-center gap-1">
                          <X className="w-3 h-3 text-red-400" />
                          Sin rating
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          {rating}
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        ({photos.filter(p => p.rating === rating).length})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtro por favoritas */}
            <div className="space-y-2">
              <Label className="font-medium">Favoritas</Label>
              <RadioGroup 
                value={includeFavorites === null ? 'both' : includeFavorites ? 'yes' : 'no'} 
                onValueChange={(value) => 
                  setIncludeFavorites(value === 'both' ? null : value === 'yes')
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="fav-both" />
                  <Label htmlFor="fav-both" className="text-sm">
                    Todas ({photos.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="fav-yes" />
                  <Label htmlFor="fav-yes" className="text-sm flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-400 fill-current" />
                    Solo favoritas ({photos.filter(p => p.isFavorite).length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="fav-no" />
                  <Label htmlFor="fav-no" className="text-sm">
                    Solo no favoritas ({photos.filter(p => !p.isFavorite).length})
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Filtro por etiquetas de color */}
            <div className="space-y-2">
              <Label className="font-medium">Etiquetas de color</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tag-green"
                    checked={includeColorTags.green}
                    onCheckedChange={(checked) => 
                      setIncludeColorTags(prev => ({ ...prev, green: checked as boolean }))
                    }
                  />
                  <Label htmlFor="tag-green" className="text-sm flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    Seleccionadas ({photos.filter(p => p.colorTag === 'green').length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tag-yellow"
                    checked={includeColorTags.yellow}
                    onCheckedChange={(checked) => 
                      setIncludeColorTags(prev => ({ ...prev, yellow: checked as boolean }))
                    }
                  />
                  <Label htmlFor="tag-yellow" className="text-sm flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    Revisar ({photos.filter(p => p.colorTag === 'yellow').length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tag-red"
                    checked={includeColorTags.red}
                    onCheckedChange={(checked) => 
                      setIncludeColorTags(prev => ({ ...prev, red: checked as boolean }))
                    }
                  />
                  <Label htmlFor="tag-red" className="text-sm flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    Descartar ({photos.filter(p => p.colorTag === 'red').length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tag-none"
                    checked={includeColorTags.none}
                    onCheckedChange={(checked) => 
                      setIncludeColorTags(prev => ({ ...prev, none: checked as boolean }))
                    }
                  />
                  <Label htmlFor="tag-none" className="text-sm flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    Sin etiqueta ({photos.filter(p => !p.colorTag).length})
                  </Label>
                </div>
              </div>
            </div>

            {/* Filtro por revisadas */}
            <div className="space-y-2">
              <Label className="font-medium">Estado de revisión</Label>
              <RadioGroup 
                value={includeReviewed === null ? 'both' : includeReviewed ? 'yes' : 'no'} 
                onValueChange={(value) => 
                  setIncludeReviewed(value === 'both' ? null : value === 'yes')
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="rev-both" />
                  <Label htmlFor="rev-both" className="text-sm">
                    Todas ({photos.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="rev-yes" />
                  <Label htmlFor="rev-yes" className="text-sm">
                    Solo revisadas ({photos.filter(p => p.isReviewed).length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="rev-no" />
                  <Label htmlFor="rev-no" className="text-sm">
                    Solo no revisadas ({photos.filter(p => !p.isReviewed).length})
                  </Label>
                </div>
              </RadioGroup>
            </div>
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
              <p>• Se exportarán <strong>{filterPhotos().length} fotos</strong> de {photos.length} total</p>
              
              {/* Mostrar filtros activos solo si no son los predeterminados */}
              {(selectedRatings.length < 6 || 
                includeFavorites !== null || 
                !Object.values(includeColorTags).every(v => v) || 
                includeReviewed !== null) && (
                <div className="mt-1 pt-1 border-t border-muted-foreground/20">
                  <p className="font-medium">Filtros activos:</p>
                  {selectedRatings.length < 6 && selectedRatings.length > 0 && (
                    <p>→ Ratings: {selectedRatings.map(r => r === 0 ? 'Sin rating' : `${r}★`).join(', ')}</p>
                  )}
                  {includeFavorites === true && <p>→ Solo favoritas</p>}
                  {includeFavorites === false && <p>→ Solo no favoritas</p>}
                  {includeReviewed === true && <p>→ Solo revisadas</p>}
                  {includeReviewed === false && <p>→ Solo no revisadas</p>}
                  {!Object.values(includeColorTags).every(v => v) && (
                    <p>→ Etiquetas: {
                      Object.entries(includeColorTags)
                        .filter(([_, included]) => included)
                        .map(([tag, _]) => {
                          switch(tag) {
                            case 'green': return 'Seleccionadas'
                            case 'yellow': return 'Revisar' 
                            case 'red': return 'Descartar'
                            case 'none': return 'Sin etiqueta'
                            default: return tag
                          }
                        })
                        .join(', ') || 'Ninguna'
                    }</p>
                  )}
                </div>
              )}
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
          <Button 
            onClick={handleExport} 
            className="gap-2"
            disabled={filterPhotos().length === 0}
            title={filterPhotos().length === 0 ? 'No hay fotos que coincidan con los filtros' : ''}
          >
            {exportType === 'excel' ? <FileSpreadsheet className="w-4 h-4" /> :
             exportType === 'txt' ? <FileText className="w-4 h-4" /> :
             <Copy className="w-4 h-4" />}
            {exportType === 'excel' ? 'Exportar Excel' :
             exportType === 'txt' ? 'Exportar TXT' :
             'Copiar'} ({filterPhotos().length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 