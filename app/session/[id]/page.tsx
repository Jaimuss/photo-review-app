"use client"

import { useState, useEffect } from "react"
import {
  Star,
  Heart,
  Filter,
  Grid3X3,
  Eye,
  MessageSquare,
  Download,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  Copy,
  Play,
} from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useParams } from "next/navigation"
import { PhotoComparison } from "@/components/photo-comparison"
import { Slideshow } from "@/components/slideshow"

// Mock data - now loaded from API
// const sessionData = { ... }

// Mock photos - now loaded from API
// const mockPhotos = [ ... ]

const colorTags = [
  { value: "green", label: "Seleccionar", color: "bg-green-500" },
  { value: "yellow", label: "Revisar", color: "bg-yellow-500" },
  { value: "red", label: "Descartar", color: "bg-red-500" },
]

export default function PhotoReviewSession() {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid")
  const [filterRating, setFilterRating] = useState<string>("all")
  const [filterColor, setFilterColor] = useState<string>("all")
  const [photos, setPhotos] = useState<any[]>([])
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const { id: sessionId } = useParams()

  useEffect(() => {
    loadSessionData()

    // Configurar notificaciones en tiempo real
    const eventSource = new EventSource(`/api/sessions/${sessionId}/events`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "photo_updated") {
        // En una app real mostrarías una notificación
        console.log("Foto actualizada:", data.message)
        // Recargar datos
        loadSessionData()
      }
    }

    return () => {
      eventSource.close()
    }
  }, [sessionId])

  // Actualizar la función loadSessionData
  const loadSessionData = async () => {
    try {
      // Llamada a nuestra API
      const response = await fetch(`/api/sessions/${sessionId}`)

      if (!response.ok) {
        throw new Error("Error al cargar la sesión")
      }

      const data = await response.json()
      setPhotos(data.photos || [])
      setSessionData(data.session || {})
    } catch (error) {
      console.error("Error loading session:", error)
      // Fallback data in case of error
      setSessionData({
        id: sessionId,
        clientName: "Cliente",
        photographer: "Fotógrafo", 
        date: new Date().toLocaleDateString('es-ES'),
        location: "Sesión fotográfica",
        totalPhotos: 0,
        reviewedPhotos: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePhotoRating = (photoId: string, rating: number) => {
    setPhotos((prev) => prev.map((photo) => (photo.id === photoId ? { ...photo, rating, isReviewed: true } : photo)))
  }

  const updatePhotoColorTag = (photoId: string, colorTag: string | null) => {
    setPhotos((prev) => prev.map((photo) => (photo.id === photoId ? { ...photo, colorTag, isReviewed: true } : photo)))
  }

  const updatePhotoComment = (photoId: string, comment: string) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, comments: comment, isReviewed: true } : photo)),
    )
  }

  const toggleFavorite = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, isFavorite: !photo.isFavorite } : photo)),
    )
  }

  const toggleComparisonSelection = (photoId: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId)
      } else if (prev.length < 4) { // Máximo 4 fotos para comparar
        return [...prev, photoId]
      }
      return prev
    })
  }

  const startComparison = () => {
    if (selectedForComparison.length >= 2) {
      setShowComparison(true)
    }
  }

  const handleUpdatePhotoInComparison = (photoId: string, updates: any) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, ...updates, isReviewed: true } : photo
    ))
  }

  const filteredPhotos = photos.filter((photo) => {
    if (filterRating !== "all" && photo.rating !== Number.parseInt(filterRating)) return false
    if (filterColor !== "all" && photo.colorTag !== filterColor) return false
    return true
  })

  const reviewedCount = photos.filter((p) => p.isReviewed).length
  const progressPercentage = (reviewedCount / photos.length) * 100

  const StarRating = ({
    rating,
    onRatingChange,
    size = "w-5 h-5",
  }: { rating: number; onRatingChange?: (rating: number) => void; size?: string }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} cursor-pointer transition-colors ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => onRatingChange?.(star)}
        />
      ))}
    </div>
  )

  const ColorTagSelector = ({
    currentTag,
    onTagChange,
  }: { currentTag: string | null; onTagChange: (tag: string | null) => void }) => (
    <div className="flex gap-2">
      <Button variant={currentTag === null ? "default" : "outline"} size="sm" onClick={() => onTagChange(null)}>
        Sin etiqueta
      </Button>
      {colorTags.map((tag) => (
        <Button
          key={tag.value}
          variant={currentTag === tag.value ? "default" : "outline"}
          size="sm"
          className={currentTag === tag.value ? `${tag.color} text-white` : ""}
          onClick={() => onTagChange(tag.value)}
        >
          <div className={`w-3 h-3 rounded-full ${tag.color} mr-2`} />
          {tag.label}
        </Button>
      ))}
    </div>
  )

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando fotos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sessionData?.location || 'Sesión fotográfica'}
              </h1>
              <p className="text-gray-600">
                Cliente: {sessionData?.clientName || 'Cliente'} • {sessionData?.date || 'Fecha'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Progreso de revisión</p>
                <div className="flex items-center gap-2">
                  <Progress value={progressPercentage} className="w-32" />
                  <span className="text-sm font-medium">
                    {reviewedCount}/{photos.length}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar Reporte
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="gap-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "carousel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("carousel")}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Carrusel
                </Button>
                
                {selectedForComparison.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={startComparison}
                    disabled={selectedForComparison.length < 2}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Comparar ({selectedForComparison.length})
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSlideshow(true)}
                  disabled={filteredPhotos.length === 0}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Slideshow
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="5">5 estrellas</SelectItem>
                    <SelectItem value="4">4 estrellas</SelectItem>
                    <SelectItem value="3">3 estrellas</SelectItem>
                    <SelectItem value="2">2 estrellas</SelectItem>
                    <SelectItem value="1">1 estrella</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterColor} onValueChange={setFilterColor}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="green">Seleccionar</SelectItem>
                    <SelectItem value="yellow">Revisar</SelectItem>
                    <SelectItem value="red">Descartar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Mostrando {filteredPhotos.length} de {photos.length} fotos
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredPhotos.map((photo, index) => (
              <Card key={photo.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0 relative">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={photo.url || "/placeholder.svg"}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover cursor-pointer"
                      onClick={() => setSelectedPhoto(index)}
                    />

                    {/* Overlay con controles */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedForComparison.includes(photo.id)}
                          onChange={() => toggleComparisonSelection(photo.id)}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        {photo.isFavorite && <Heart className="w-5 h-5 fill-red-500 text-red-500" />}
                        {photo.colorTag && (
                          <div
                            className={`w-5 h-5 rounded-full ${colorTags.find((t) => t.value === photo.colorTag)?.color}`}
                          />
                        )}
                        {photo.isReviewed && <Check className="w-5 h-5 fill-green-500 text-green-500" />}
                      </div>
                    </div>
                  </div>

                  {/* Rating y controles */}
                  <div className="p-3 space-y-2">
                    <StarRating
                      rating={photo.rating}
                      onRatingChange={(rating) => updatePhotoRating(photo.id, rating)}
                      size="w-4 h-4"
                    />

                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => toggleFavorite(photo.id)} className="p-1">
                        <Heart
                          className={`w-4 h-4 ${photo.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                        />
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(index)} className="p-1">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPhotos.map((photo, index) => (
              <Card key={photo.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Foto #{index + 1}</h3>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Calificación</label>
                            <StarRating
                              rating={photo.rating}
                              onRatingChange={(rating) => updatePhotoRating(photo.id, rating)}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Etiqueta de color</label>
                            <ColorTagSelector
                              currentTag={photo.colorTag}
                              onTagChange={(tag) => updatePhotoColorTag(photo.id, tag)}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Comentarios para el retocador
                            </label>
                            <Textarea
                              placeholder="Ej: Aclarar un poco el fondo, mejorar el contraste..."
                              value={photo.comments}
                              onChange={(e) => updatePhotoComment(photo.id, e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant={photo.isFavorite ? "default" : "outline"}
                              onClick={() => toggleFavorite(photo.id)}
                              className="gap-2"
                            >
                              <Heart className={`w-4 h-4 ${photo.isFavorite ? "fill-white" : ""}`} />
                              {photo.isFavorite ? "Favorita" : "Marcar favorita"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal para vista individual */}
      <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          {selectedPhoto !== null && (
            <div className="grid lg:grid-cols-3 h-full">
              <div className="lg:col-span-2 relative bg-black">
                <Image
                  src={filteredPhotos[selectedPhoto].url || "/placeholder.svg"}
                  alt={`Foto ${selectedPhoto + 1}`}
                  fill
                  className="object-contain"
                />

                {/* Navegación */}
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setSelectedPhoto(Math.max(0, selectedPhoto - 1))}
                    disabled={selectedPhoto === 0}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute inset-y-0 right-4 flex items-center">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setSelectedPhoto(Math.min(filteredPhotos.length - 1, selectedPhoto + 1))}
                    disabled={selectedPhoto === filteredPhotos.length - 1}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute top-4 right-4">
                  <Button variant="secondary" size="icon" onClick={() => setSelectedPhoto(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Foto #{selectedPhoto + 1}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Calificación</label>
                    <StarRating
                      rating={filteredPhotos[selectedPhoto].rating}
                      onRatingChange={(rating) => updatePhotoRating(filteredPhotos[selectedPhoto].id, rating)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Etiqueta de color</label>
                    <ColorTagSelector
                      currentTag={filteredPhotos[selectedPhoto].colorTag}
                      onTagChange={(tag) => updatePhotoColorTag(filteredPhotos[selectedPhoto].id, tag)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Comentarios para el retocador
                    </label>
                    <Textarea
                      placeholder="Ej: Aclarar un poco el fondo, mejorar el contraste..."
                      value={filteredPhotos[selectedPhoto].comments}
                      onChange={(e) => updatePhotoComment(filteredPhotos[selectedPhoto].id, e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button
                    variant={filteredPhotos[selectedPhoto].isFavorite ? "default" : "outline"}
                    onClick={() => toggleFavorite(filteredPhotos[selectedPhoto].id)}
                    className="w-full gap-2"
                  >
                    <Heart className={`w-4 h-4 ${filteredPhotos[selectedPhoto].isFavorite ? "fill-white" : ""}`} />
                    {filteredPhotos[selectedPhoto].isFavorite ? "Favorita" : "Marcar como favorita"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Comparación */}
      {showComparison && (
        <PhotoComparison
          photos={selectedForComparison.map(id => {
            const photo = photos.find(p => p.id === id)!
            return {
              id: photo.id,
              url: photo.url,
              filename: photo.filename || `Foto ${photo.id}`,
              rating: photo.rating,
              isFavorite: photo.isFavorite,
              colorTag: photo.colorTag,
              comments: photo.comments
            }
          })}
          onClose={() => {
            setShowComparison(false)
            setSelectedForComparison([])
          }}
          onUpdatePhoto={handleUpdatePhotoInComparison}
        />
      )}

      {/* Modal de Slideshow */}
      <Slideshow
        photos={filteredPhotos.map(photo => ({
          id: photo.id,
          url: photo.url,
          rating: photo.rating || 3,
          isFavorite: photo.isFavorite || false,
          colorTag: photo.colorTag
        }))}
        isOpen={showSlideshow}
        onClose={() => setShowSlideshow(false)}
        startIndex={selectedPhoto || 0}
      />
    </div>
  )
}
