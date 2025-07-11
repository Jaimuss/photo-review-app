'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, Move, Star, Heart, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Photo {
  id: string
  url: string
  filename: string
  rating?: number
  isFavorite?: boolean
  colorTag?: string
  comments?: string
}

interface PhotoComparisonProps {
  photos: Photo[]
  onClose: () => void
  onUpdatePhoto: (photoId: string, updates: any) => void
}

export function PhotoComparison({ photos, onClose, onUpdatePhoto }: PhotoComparisonProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Resetear zoom cuando cambian las fotos
  useEffect(() => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }, [photos])

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.1))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      
      setPanPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleRating = (photoId: string, rating: number) => {
    onUpdatePhoto(photoId, { rating })
  }

  const handleFavorite = (photoId: string, isFavorite: boolean) => {
    onUpdatePhoto(photoId, { isFavorite: !isFavorite })
  }

  const handleColorTag = (photoId: string, colorTag: string | null) => {
    onUpdatePhoto(photoId, { colorTag })
  }

  const handleComments = (photoId: string, comments: string) => {
    onUpdatePhoto(photoId, { comments })
  }

  const getColorTagColor = (tag: string | undefined) => {
    switch (tag) {
      case 'green': return 'bg-green-500'
      case 'yellow': return 'bg-yellow-500'
      case 'red': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const getGridCols = () => {
    if (photos.length === 2) return 'grid-cols-1 md:grid-cols-2'
    if (photos.length === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    return 'grid-cols-1 md:grid-cols-2'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2 md:p-4 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 md:gap-4">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            Comparación ({photos.length})
          </h2>
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.1}
              className="text-white border-white/20 hover:bg-white/10 p-2"
            >
              <ZoomOut className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <span className="text-white text-xs md:text-sm min-w-[3rem] md:min-w-[4rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 5}
              className="text-white border-white/20 hover:bg-white/10 p-2"
            >
              <ZoomIn className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
              className="text-white border-white/20 hover:bg-white/10 p-2"
            >
              <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
          {zoomLevel > 1 && (
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Move className="h-4 w-4" />
              Arrastra para moverte
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-white border-white/20 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Grid de Fotos */}
        <div className={`flex-1 grid ${getGridCols()} gap-2 p-2 md:p-4`}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative bg-black rounded-lg overflow-hidden border-2 border-white/10 hover:border-white/30 transition-colors"
            >
              {/* Imagen */}
              <div
                ref={containerRef}
                className="aspect-[3/2] overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={photo.url}
                  alt={photo.filename}
                  className="w-full h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                    transformOrigin: 'center center'
                  }}
                  draggable={false}
                />
              </div>

              {/* Overlay de información */}
              <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {photo.filename}
                  </Badge>
                  {photo.colorTag && (
                    <div className={`w-4 h-4 rounded-full ${getColorTagColor(photo.colorTag)}`} />
                  )}
                </div>
                {photo.isFavorite && (
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                )}
              </div>

              {/* Rating */}
              <div className="absolute bottom-2 left-2 flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(photo.id, star)}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= (photo.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                ))}
                <button
                  onClick={() => handleRating(photo.id, 0)}
                  className="transition-colors text-red-400 ml-1"
                  title="Quitar rating"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Botón para seleccionar foto para editar */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={() => setSelectedPhoto(selectedPhoto === photo.id ? null : photo.id)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Panel lateral de edición */}
        {selectedPhoto && (
          <div className="w-full lg:w-80 bg-black/50 backdrop-blur-sm border-t lg:border-l lg:border-t-0 border-white/20 p-2 md:p-4 max-h-96 lg:max-h-none overflow-y-auto">
            <PhotoEditPanel
              photo={photos.find(p => p.id === selectedPhoto)!}
              onUpdate={(updates) => onUpdatePhoto(selectedPhoto, updates)}
              onClose={() => setSelectedPhoto(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Componente del panel de edición
function PhotoEditPanel({ 
  photo, 
  onUpdate, 
  onClose 
}: { 
  photo: Photo
  onUpdate: (updates: any) => void
  onClose: () => void
}) {
  const [comments, setComments] = useState(photo.comments || '')

  const handleSaveComments = () => {
    onUpdate({ comments })
  }

  return (
    <Card className="p-4 bg-black/30 border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Editar Foto</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Información básica */}
        <div>
          <Label className="text-white text-sm">Archivo</Label>
          <p className="text-white/70 text-sm">{photo.filename}</p>
        </div>

        {/* Rating */}
        <div>
          <Label className="text-white text-sm">Calificación</Label>
          <div className="flex gap-1 mt-1">
            {[0, 1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onUpdate({ rating: star })}
                className="transition-colors"
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= (photo.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Favorito */}
        <div>
          <button
            onClick={() => onUpdate({ isFavorite: !photo.isFavorite })}
            className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
          >
            <Heart 
              className={`h-5 w-5 ${photo.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
            />
            {photo.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          </button>
        </div>

        {/* Tags de color */}
        <div>
          <Label className="text-white text-sm">Etiqueta</Label>
          <div className="flex gap-2 mt-1">
            {[
              { color: 'green', label: 'Seleccionar' },
              { color: 'yellow', label: 'Revisar' },
              { color: 'red', label: 'Descartar' },
              { color: null, label: 'Ninguna' }
            ].map(({ color, label }) => (
              <Button
                key={color || 'none'}
                variant={photo.colorTag === color ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate({ colorTag: color })}
                className={`${
                  color 
                    ? `border-${color}-500 text-${color}-400` 
                    : 'border-gray-500 text-gray-400'
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Comentarios */}
        <div>
          <Label className="text-white text-sm">Comentarios</Label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Agrega comentarios sobre esta foto..."
            className="mt-1 bg-black/30 border-white/20 text-white placeholder:text-white/50"
            rows={3}
          />
          <Button
            onClick={handleSaveComments}
            size="sm"
            className="mt-2 w-full"
          >
            Guardar Comentarios
          </Button>
        </div>
      </div>
    </Card>
  )
} 