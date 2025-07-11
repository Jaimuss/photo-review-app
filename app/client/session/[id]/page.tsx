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
  ChevronUp,
  ChevronDown,
  Camera,
} from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Slideshow } from "@/components/slideshow"
import { ExportDialog } from "@/components/export-dialog"

// Types
interface Photo {
  id: string
  url: string
  rating: number
  isFavorite: boolean
  colorTag: string | null
  comments: string
  isReviewed: boolean
}

interface Session {
  id: string
  clientName: string
  photographer: string
  date: string
  location: string
  totalPhotos: number
  reviewedPhotos: number
}

const colorTags = [
  { value: "green", label: "Seleccionar", color: "bg-green-500" },
  { value: "yellow", label: "Revisar", color: "bg-yellow-500" },
  { value: "red", label: "Descartar", color: "bg-red-500" },
]

export default function PhotoReviewSession() {
  const params = useParams()
  const sessionId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid")
  const [filterRating, setFilterRating] = useState<string>("all")
  const [filterColor, setFilterColor] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([])
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Simular carga de datos del backend
  useEffect(() => {
    loadSessionData()

    // Configurar notificaciones en tiempo real
    const eventSource = new EventSource(`/api/sessions/${sessionId}/events`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "photo_updated") {
        toast({
          title: "Foto actualizada",
          description: "El fotógrafo ha actualizado una foto en esta sesión",
        })
        // Recargar datos
        loadSessionData()
      }
    }

    return () => {
      eventSource.close()
    }
  }, [sessionId])

  useEffect(() => {
    setFilteredPhotos(
      photos.filter((photo) => {
        if (filterRating !== "all" && photo.rating !== Number.parseInt(filterRating)) return false
        if (filterColor !== "all" && photo.colorTag !== filterColor) return false
        return true
      }),
    )
  }, [photos, filterRating, filterColor])

  const loadSessionData = async () => {
    setLoading(true)
    try {
      // Llamada a nuestra API
      const response = await fetch(`/api/sessions/${sessionId}`)

      if (!response.ok) {
        throw new Error("Error al cargar la sesión")
      }

      const data = await response.json()
      setSession(data.session)
      setPhotos(data.photos)
    } catch (error) {
      console.error("Error loading session:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la sesión",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePhotoRating = async (photoId: string, rating: number) => {
    try {
      const response = await fetch("/api/photos/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, rating, sessionId }),
      })

      if (response.ok) {
        setPhotos((prev) =>
          prev.map((photo) => (photo.id === photoId ? { ...photo, rating, isReviewed: true } : photo)),
        )
        toast({
          title: "Calificación actualizada",
          description: `Has calificado la foto con ${rating} estrellas`,
        })
      } else {
        throw new Error("Error al actualizar la calificación")
      }
    } catch (error) {
      console.error("Error updating rating:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la calificación",
        variant: "destructive",
      })
    }
  }

  const updatePhotoColorTag = async (photoId: string, colorTag: string | null) => {
    try {
      const response = await fetch("/api/photos/color-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, colorTag, sessionId }),
      })

      if (response.ok) {
        setPhotos((prev) =>
          prev.map((photo) => (photo.id === photoId ? { ...photo, colorTag, isReviewed: true } : photo)),
        )

        const tagName =
          colorTag === "green"
            ? "Seleccionar"
            : colorTag === "yellow"
              ? "Revisar"
              : colorTag === "red"
                ? "Descartar"
                : "Sin etiqueta"

        toast({
          title: "Etiqueta actualizada",
          description: `Has marcado la foto como: ${tagName}`,
        })
      } else {
        throw new Error("Error al actualizar la etiqueta")
      }
    } catch (error) {
      console.error("Error updating color tag:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la etiqueta",
        variant: "destructive",
      })
    }
  }

  const updatePhotoComment = async (photoId: string, comment: string) => {
    try {
      const response = await fetch("/api/photos/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, comment, sessionId }),
      })

      if (response.ok) {
        setPhotos((prev) =>
          prev.map((photo) => (photo.id === photoId ? { ...photo, comments: comment, isReviewed: true } : photo)),
        )
        toast({
          title: "Comentario guardado",
          description: "Tu comentario ha sido guardado correctamente",
        })
      } else {
        throw new Error("Error al guardar el comentario")
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el comentario",
        variant: "destructive",
      })
    }
  }

  const toggleFavorite = async (photoId: string) => {
    try {
      const photo = photos.find((p) => p.id === photoId)
      const response = await fetch("/api/photos/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isFavorite: !photo?.isFavorite, sessionId }),
      })

      if (response.ok) {
        setPhotos((prev) =>
          prev.map((photo) => (photo.id === photoId ? { ...photo, isFavorite: !photo.isFavorite } : photo)),
        )

        toast({
          title: !photo?.isFavorite ? "Añadida a favoritos" : "Eliminada de favoritos",
          description: !photo?.isFavorite
            ? "Has marcado esta foto como favorita"
            : "Has quitado esta foto de favoritos",
        })
      } else {
        throw new Error("Error al actualizar favoritos")
      }
    } catch (error) {
      console.error("Error updating favorite:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos",
        variant: "destructive",
      })
    }
  }

  const exportReport = async () => {
    try {
      toast({
        title: "Generando reporte",
        description: "Espera un momento mientras generamos tu reporte...",
      })

      const response = await fetch("/api/sessions/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        throw new Error("Error al generar el reporte")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-${session?.clientName}-${new Date().toISOString().split("T")[0]}.pdf`
      a.click()

      toast({
        title: "Reporte generado",
        description: "Tu reporte ha sido descargado correctamente",
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      })
    }
  }

  // Navegación con teclado y scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhoto === null) return

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedPhoto(Math.max(0, selectedPhoto - 1))
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedPhoto(Math.min(filteredPhotos.length - 1, selectedPhoto + 1))
      } else if (e.key === "Escape") {
        setSelectedPhoto(null)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (selectedPhoto === null) return

      e.preventDefault()
      if (e.deltaY > 0) {
        setSelectedPhoto(Math.min(filteredPhotos.length - 1, selectedPhoto + 1))
      } else {
        setSelectedPhoto(Math.max(0, selectedPhoto - 1))
      }
    }

    if (selectedPhoto !== null) {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("wheel", handleWheel)
    }
  }, [selectedPhoto, filteredPhotos.length])

  const reviewedCount = photos.filter((p) => p.isReviewed).length
  const progressPercentage = photos.length > 0 ? (reviewedCount / photos.length) * 100 : 0

  const StarRating = ({
    rating,
    onRatingChange,
    size = "w-5 h-5",
  }: { rating: number; onRatingChange?: (rating: number) => void; size?: string }) => (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} cursor-pointer transition-colors ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
          onClick={() => onRatingChange?.(star)}
        />
      ))}
      <button
        onClick={() => onRatingChange?.(0)}
        className={`${size} cursor-pointer transition-colors text-red-400 ml-2`}
        title="Quitar rating"
      >
        <X className={size} />
      </button>
    </div>
  )

  const ColorTagSelector = ({
    currentTag,
    onTagChange,
  }: { currentTag: string | null; onTagChange: (tag: string | null) => void }) => (
    <div className="flex gap-2 flex-wrap">
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              <h1 className="text-xl font-bold">Photo Review App</h1>
            </div>
            <ModeToggle />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando sesión...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              <h1 className="text-xl font-bold">Photo Review App</h1>
            </div>
            <ModeToggle />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Error al cargar la sesión</p>
            <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/")}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  <h1 className="text-xl font-bold">{session.location}</h1>
                </div>
                <p className="text-muted-foreground">
                  Cliente: {session.clientName} • {session.date}
                </p>
              </div>
              <div className="lg:hidden">
                <ModeToggle />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="text-left lg:text-right">
                <p className="text-sm text-muted-foreground">Progreso de revisión</p>
                <div className="flex items-center gap-2">
                  <Progress value={progressPercentage} className="w-32" />
                  <span className="text-sm font-medium">
                    {reviewedCount}/{photos.length}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setShowExportDialog(true)}>
                  <Download className="w-4 h-4" />
                  Exportar Excel
                </Button>
                <div className="hidden lg:block">
                  <ModeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
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
                    <SelectItem value="0">0 estrellas</SelectItem>
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

            <div className="text-sm text-muted-foreground">
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
                      onDoubleClick={() => {
                        setSelectedPhoto(index);
                        setShowSlideshow(true);
                      }}
                    />

                    {/* Overlay con controles */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-colors">
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
                          className={`w-4 h-4 ${photo.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
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
                            <label className="text-sm font-medium mb-2 block">Calificación</label>
                            <StarRating
                              rating={photo.rating}
                              onRatingChange={(rating) => updatePhotoRating(photo.id, rating)}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Etiqueta de color</label>
                            <ColorTagSelector
                              currentTag={photo.colorTag}
                              onTagChange={(tag) => updatePhotoColorTag(photo.id, tag)}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Comentarios para el retocador</label>
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
              <div className="lg:col-span-2 relative bg-black min-h-[400px]">
                <Image
                  src={filteredPhotos[selectedPhoto].url || "/placeholder.svg"}
                  alt={`Foto ${selectedPhoto + 1}`}
                  fill
                  className="object-contain"
                />

                {/* Navegación horizontal */}
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

                {/* Navegación vertical */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setSelectedPhoto(Math.max(0, selectedPhoto - 1))}
                    disabled={selectedPhoto === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setSelectedPhoto(Math.min(filteredPhotos.length - 1, selectedPhoto + 1))}
                    disabled={selectedPhoto === filteredPhotos.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute top-4 right-4">
                  <Button variant="secondary" size="icon" onClick={() => setSelectedPhoto(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Indicador de posición */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedPhoto + 1} / {filteredPhotos.length}
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Foto #{selectedPhoto + 1}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Calificación</label>
                    <StarRating
                      rating={filteredPhotos[selectedPhoto].rating}
                      onRatingChange={(rating) => updatePhotoRating(filteredPhotos[selectedPhoto].id, rating)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Etiqueta de color</label>
                    <ColorTagSelector
                      currentTag={filteredPhotos[selectedPhoto].colorTag}
                      onTagChange={(tag) => updatePhotoColorTag(filteredPhotos[selectedPhoto].id, tag)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Comentarios para el retocador</label>
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

                {/* Instrucciones de navegación */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    💡 <strong>Navegación:</strong>
                  </p>
                  <p>• Flechas del teclado o scroll del mouse</p>
                  <p>• Botones arriba/abajo o izquierda/derecha</p>
                  <p>• ESC para cerrar</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />

      {/* Modal de Slideshow */}
      <Slideshow
        photos={filteredPhotos.map(photo => ({
          id: photo.id,
          url: photo.url,
          rating: photo.rating || 0,
          isFavorite: photo.isFavorite || false,
          colorTag: photo.colorTag,
          comments: photo.comments
        }))}
        isOpen={showSlideshow}
        onClose={() => setShowSlideshow(false)}
        startIndex={selectedPhoto || 0}
        onUpdatePhoto={(photoId, updates) => {
          setPhotos(prev => 
            prev.map(photo => 
              photo.id === photoId ? { ...photo, ...updates, isReviewed: true } : photo
            )
          )
                 }}
       />

      {/* Diálogo de Exportación */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        session={{
          id: session?.id || '',
          clientName: session?.clientName || '',
          photographer: session?.photographer || '',
          date: session?.date || '',
          location: session?.location || ''
        }}
                 photos={photos.map(photo => ({
           id: photo.id,
           filename: `foto_${photo.id}.jpg`,
           rating: photo.rating,
           isFavorite: photo.isFavorite,
           colorTag: photo.colorTag,
           comments: photo.comments,
           isReviewed: photo.isReviewed
         }))}
      />
    </div>
  )
}
