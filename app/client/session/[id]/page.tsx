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
  ChevronUp,
  ChevronDown,
  Camera,
  CheckSquare,
  Settings,
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
import { PhotoComparison } from "@/components/photo-comparison"

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
  const [showComparison, setShowComparison] = useState(false)
  // Estados para selección múltiple (unificada para acciones masivas y comparación)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Estados para selección por área con el ratón
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 })
  const [dragStartPhotos, setDragStartPhotos] = useState<string[]>([])
  const [isCtrlHeld, setIsCtrlHeld] = useState(false)

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

  // Funciones para selección múltiple
  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    )
  }

  const selectAllPhotos = () => {
    setSelectedPhotos(filteredPhotos.map(photo => photo.id))
  }

  const clearSelection = () => {
    setSelectedPhotos([])
    setShowBulkActions(false)
  }

  // Funciones para selección por área con el ratón
  const handleMouseDown = (e: React.MouseEvent) => {
    // Solo bloquear si se hizo clic en un botón (permitir drag desde fotos)
    if ((e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('[role="button"]')) {
      return
    }

    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    setIsDragging(true)
    setDragStart({ x: startX, y: startY })
    setDragEnd({ x: startX, y: startY })
    setIsCtrlHeld(e.ctrlKey) // Guardar estado del Ctrl
    
    // Guardar selección actual para poder mantenerla con Ctrl
    if (e.ctrlKey) {
      setDragStartPhotos([...selectedPhotos])
    } else {
      setDragStartPhotos([])
      setSelectedPhotos([]) // Clear current selection if not holding Ctrl
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    setDragEnd({ x: currentX, y: currentY })

    // Calcular qué fotos están dentro del área de selección
    const selectionRect = {
      left: Math.min(dragStart.x, currentX),
      top: Math.min(dragStart.y, currentY),
      right: Math.max(dragStart.x, currentX),
      bottom: Math.max(dragStart.y, currentY)
    }

    const photosInSelection: string[] = []
    const photoElements = document.querySelectorAll('[data-photo-card]')
    
    photoElements.forEach((element) => {
      const photoRect = element.getBoundingClientRect()
      const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      
      const elementRelativeRect = {
        left: photoRect.left - containerRect.left,
        top: photoRect.top - containerRect.top,
        right: photoRect.right - containerRect.left,
        bottom: photoRect.bottom - containerRect.top
      }

      // Check if photo intersects with selection rectangle
      if (elementRelativeRect.left < selectionRect.right &&
          elementRelativeRect.right > selectionRect.left &&
          elementRelativeRect.top < selectionRect.bottom &&
          elementRelativeRect.bottom > selectionRect.top) {
        const photoId = element.getAttribute('data-photo-id')
        if (photoId) {
          photosInSelection.push(photoId)
        }
      }
    })

    // Combinar con selección inicial si se mantuvo Ctrl al inicio
    const finalSelection = isCtrlHeld 
      ? [...dragStartPhotos, ...photosInSelection]
      : photosInSelection

    setSelectedPhotos([...new Set(finalSelection)]) // Remove duplicates
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return

    setIsDragging(false)
    setIsCtrlHeld(false) // Limpiar estado del Ctrl
    // La selección final ya está establecida en handleMouseMove
  }

  // Efecto para cerrar acciones masivas cuando no hay fotos seleccionadas
  useEffect(() => {
    if (selectedPhotos.length === 0 && showBulkActions) {
      setShowBulkActions(false)
    }
  }, [selectedPhotos.length, showBulkActions])

  const startComparison = () => {
    if (selectedPhotos.length >= 2) {
      setShowComparison(true)
    }
  }

  const applyBulkRating = async (rating: number) => {
    const promises = selectedPhotos.map(photoId => updatePhotoRating(photoId, rating))
    await Promise.all(promises)
  }

  const applyBulkColorTag = async (colorTag: string | null) => {
    const promises = selectedPhotos.map(photoId => updatePhotoColorTag(photoId, colorTag))
    await Promise.all(promises)
  }

  const applyBulkFavorite = async (isFavorite: boolean) => {
    const promises = selectedPhotos.map(async (photoId) => {
      try {
        const response = await fetch('/api/photos/favorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId, isFavorite })
        })
        if (response.ok) {
          setPhotos(prev => prev.map(photo => 
            photo.id === photoId ? { ...photo, isFavorite } : photo
          ))
        }
      } catch (error) {
        console.error('Error al actualizar favorito:', error)
      }
    })
    
    await Promise.all(promises)
  }

  // Controles de teclado para fotos seleccionadas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo aplicar controles si hay fotos seleccionadas y no estamos en un input
      if (selectedPhotos.length === 0 || 
          e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Prevenir comportamiento por defecto para nuestras teclas
      const preventDefaultKeys = ['0', '1', '2', '3', '4', '5', 'g', 'y', 'r', 'f', 'Escape']
      if (preventDefaultKeys.includes(e.key.toLowerCase()) || preventDefaultKeys.includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          const rating = parseInt(e.key)
          applyBulkRating(rating)
          break
        case 'g':
        case 'G':
          applyBulkColorTag('green')
          break
        case 'y':
        case 'Y':
          applyBulkColorTag('yellow')
          break
        case 'r':
        case 'R':
          applyBulkColorTag('red')
          break
        case 'f':
        case 'F':
          applyBulkFavorite(true)
          break
        case 'Escape':
          clearSelection()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhotos.length, applyBulkRating, applyBulkColorTag, applyBulkFavorite, clearSelection])

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
                  Exportar Revisión
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
                
                {/* Controles de selección múltiple */}
                <div className="h-6 w-px bg-border mx-2" />
                <Button
                  variant={selectedPhotos.length > 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectedPhotos.length > 0 ? clearSelection() : selectAllPhotos()}
                  className="gap-2"
                  title={selectedPhotos.length > 0 ? "Deseleccionar todas las fotos" : "Seleccionar todas las fotos (o usa CTRL + Click o arrastra para seleccionar área)"}
                >
                  <CheckSquare className="w-4 h-4" />
                  {selectedPhotos.length > 0 ? `Deseleccionar (${selectedPhotos.length})` : "Seleccionar todo"}
                </Button>
                
                {selectedPhotos.length >= 2 && selectedPhotos.length <= 4 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={startComparison}
                    className="gap-2"
                    title="Comparar fotos seleccionadas lado a lado (2-4 fotos)"
                  >
                    <Eye className="w-4 h-4" />
                    Comparar ({selectedPhotos.length})
                  </Button>
                )}
                
                {selectedPhotos.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="gap-2"
                    title="Mostrar panel de acciones masivas para las fotos seleccionadas"
                  >
                    <Settings className="w-4 h-4" />
                    Acciones masivas
                  </Button>
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Mostrando {filteredPhotos.length} de {photos.length} fotos
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedPhotos.length > 0 && showBulkActions && (
        <div className="bg-secondary/50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium">
                  Aplicar a {selectedPhotos.length} fotos seleccionadas (CTRL + Click o selección por área):
                </span>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                  💡 Teclas: 0-5 (rating), G/Y/R (etiquetas), F (favorita), ESC (limpiar)
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyBulkRating(0)}
                      className="gap-1 h-8 px-2"
                      title="Sin calificación"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                      0
                    </Button>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant="outline"
                        size="sm"
                        onClick={() => applyBulkRating(rating)}
                        className="gap-1 h-8 px-2"
                      >
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Etiqueta:</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyBulkColorTag('green')}
                      className="gap-1 h-8 px-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Seleccionar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyBulkColorTag('yellow')}
                      className="gap-1 h-8 px-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      Revisar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyBulkColorTag('red')}
                      className="gap-1 h-8 px-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Descartar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyBulkColorTag(null)}
                      className="gap-1 h-8 px-2"
                    >
                      <X className="w-3 h-3" />
                      Quitar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Favoritas:</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyBulkFavorite(true)}
                      className="gap-1 h-8 px-2"
                    >
                      <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                      Marcar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyBulkFavorite(false)}
                      className="gap-1 h-8 px-2"
                    >
                      <Heart className="w-3 h-3" />
                      Quitar
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBulkActions(false)}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === "grid" ? (
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
          >
            {/* Overlay de selección por área */}
            {isDragging && (
              <div
                className="absolute bg-blue-500/20 border-2 border-blue-500 pointer-events-none z-10"
                style={{
                  left: Math.min(dragStart.x, dragEnd.x),
                  top: Math.min(dragStart.y, dragEnd.y),
                  width: Math.abs(dragEnd.x - dragStart.x),
                  height: Math.abs(dragEnd.y - dragStart.y),
                }}
              />
            )}
            {filteredPhotos.map((photo, index) => (
              <Card 
                key={photo.id} 
                data-photo-card
                data-photo-id={photo.id}
                className={`group overflow-hidden transition-all ${
                  selectedPhotos.includes(photo.id) 
                    ? 'ring-4 ring-white dark:ring-gray-300 ring-opacity-90 dark:ring-opacity-80 shadow-2xl shadow-gray-200/50 dark:shadow-gray-400/30 scale-[1.02] bg-white/80 dark:bg-gray-700/40' 
                    : 'hover:ring-2 hover:ring-white/70 dark:hover:ring-gray-300/60 hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-gray-400/20 hover:scale-[1.01] hover:bg-white/40 dark:hover:bg-gray-700/20'
                }`}>
                <CardContent className="p-0 relative">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={photo.url || "/placeholder.svg"}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover cursor-pointer"
                      onMouseDown={(e) => {
                        if (e.ctrlKey) {
                          // CTRL + Click para selección múltiple - evitar propagación
                          e.stopPropagation();
                          e.preventDefault();
                          togglePhotoSelection(photo.id);
                        }
                        // Para drag selection, dejamos que se propague al grid
                      }}
                      onClick={(e) => {
                        // Solo abrir slideshow si no se está dragging y no es CTRL+click
                        if (!isDragging && !e.ctrlKey) {
                          setSelectedPhoto(index);
                          setShowSlideshow(true);
                        }
                      }}
                    />

                    {/* Indicadores sutiles */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {photo.isFavorite && <Heart className="w-5 h-5 fill-red-500 text-red-500" />}
                      {photo.colorTag && (
                        <div
                          className={`w-5 h-5 rounded-full ${colorTags.find((t) => t.value === photo.colorTag)?.color}`}
                        />
                      )}
      
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

      {/* Modal de Comparación */}
      {showComparison && (
        <PhotoComparison
          photos={selectedPhotos.slice(0, 4).map(id => {
            const photo = photos.find(p => p.id === id)!
            return {
              id: photo.id,
              url: photo.url,
              filename: `foto_${photo.id}.jpg`,
              rating: photo.rating,
              isFavorite: photo.isFavorite,
              colorTag: photo.colorTag || undefined,
              comments: photo.comments
            }
          })}
          onClose={() => {
            setShowComparison(false)
            clearSelection()
          }}
          onUpdatePhoto={(photoId, updates) => {
            setPhotos(prev => 
              prev.map(photo => 
                photo.id === photoId ? { ...photo, ...updates, isReviewed: true } : photo
              )
            )
          }}
        />
      )}
    </div>
  )
}
