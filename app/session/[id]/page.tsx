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
  Maximize2,
  Minimize2,
  X,
  Copy,
  Play,
  CheckSquare,
  Settings,
} from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useParams } from "next/navigation"
import { PhotoComparison } from "@/components/photo-comparison"
import { Slideshow } from "@/components/slideshow"
import { ExportDialog } from "@/components/export-dialog"
import { ModeToggle } from "@/components/mode-toggle"
import { LecorralHeader } from "@/components/lecorral-header"

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
  const [showComparison, setShowComparison] = useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [gridColumns, setGridColumns] = useState(4)
  // Estados para selección múltiple (unificada para acciones masivas y comparación)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Estados para selección por área con el ratón
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 })
  const [dragStartPhotos, setDragStartPhotos] = useState<string[]>([])
  const [isCtrlHeld, setIsCtrlHeld] = useState(false)
  const [wasDragging, setWasDragging] = useState(false)
  
  const { id: sessionId } = useParams()

  useEffect(() => {
    loadSessionData()

    // Configurar notificaciones en tiempo real
    const eventSource = new EventSource(`/api/sessions/${sessionId}/events`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      // Manejar diferentes tipos de eventos
      switch (data.type) {
        case "connected":
          console.log(`Conectado a sesión ${data.sessionId}. Clientes activos: ${data.activeConnections}`)
          break
          
        case "photo_rating":
          // Actualizar solo el rating de la foto específica
          setPhotos(prev => prev.map(photo => 
            photo.id === data.photoId 
              ? { ...photo, rating: data.data.rating, isReviewed: true }
              : photo
          ))
          console.log(`Rating actualizado en tiempo real para foto ${data.photoId}: ${data.data.rating}`)
          break
          
        case "photo_favorite":
          // Actualizar solo el estado de favorito de la foto específica
          setPhotos(prev => prev.map(photo => 
            photo.id === data.photoId 
              ? { ...photo, isFavorite: data.data.isFavorite, isReviewed: true }
              : photo
          ))
          console.log(`Favorito actualizado en tiempo real para foto ${data.photoId}: ${data.data.isFavorite}`)
          break
          
        case "photo_comment":
          // Actualizar solo el comentario de la foto específica
          setPhotos(prev => prev.map(photo => 
            photo.id === data.photoId 
              ? { ...photo, comments: data.data.comment, isReviewed: true }
              : photo
          ))
          console.log(`Comentario actualizado en tiempo real para foto ${data.photoId}`)
          break
          
        case "photo_color_tag":
          // Actualizar solo la etiqueta de color de la foto específica
          setPhotos(prev => prev.map(photo => 
            photo.id === data.photoId 
              ? { ...photo, colorTag: data.data.colorTag, isReviewed: true }
              : photo
          ))
          console.log(`Etiqueta de color actualizada en tiempo real para foto ${data.photoId}: ${data.data.colorTag}`)
          break
          
        case "photo_updated":
          // Evento general - recargar datos solo si es necesario
          console.log("Foto actualizada:", data.message)
          // Solo recargar si no es uno de los eventos específicos anteriores
          loadSessionData()
          break
          
        default:
          console.log("Evento recibido:", data)
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

  const updatePhotoRating = async (photoId: string, rating: number) => {
    // Actualizar estado local inmediatamente para feedback
    setPhotos((prev) => prev.map((photo) => (photo.id === photoId ? { ...photo, rating, isReviewed: true } : photo)))
    
    // Enviar a la API
    try {
      const response = await fetch('/api/photos/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, rating })
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar rating')
      }
      
      console.log(`Rating actualizado para foto ${photoId}: ${rating} estrellas`)
    } catch (error) {
      console.error('Error al actualizar rating:', error)
      // Revertir cambio local si falla la API
      setPhotos((prev) => prev.map((photo) => (photo.id === photoId ? { ...photo, rating: photo.rating } : photo)))
    }
  }

  const updatePhotoColorTag = async (photoId: string, colorTag: string | null) => {
    // Actualizar estado local inmediatamente para feedback
    setPhotos((prev) => prev.map((photo) => (photo.id === photoId ? { ...photo, colorTag, isReviewed: true } : photo)))
    
    // Enviar a la API
    try {
      const response = await fetch('/api/photos/color-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, colorTag })
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar etiqueta de color')
      }
      
      console.log(`Etiqueta de color actualizada para foto ${photoId}: ${colorTag}`)
    } catch (error) {
      console.error('Error al actualizar etiqueta de color:', error)
      // Revertir cambio local si falla la API
      setPhotos((prev) => prev.map((photo) => (photo.id === photoId ? { ...photo, colorTag: photo.colorTag } : photo)))
    }
  }

  const updatePhotoComment = async (photoId: string, comment: string) => {
    // Actualizar estado local inmediatamente para feedback
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, comments: comment, isReviewed: true } : photo)),
    )
    
    // Enviar a la API
    try {
      const response = await fetch('/api/photos/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, comment })
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar comentario')
      }
      
      console.log(`Comentario actualizado para foto ${photoId}: ${comment}`)
    } catch (error) {
      console.error('Error al actualizar comentario:', error)
      // Revertir cambio local si falla la API
      setPhotos((prev) => prev.map((photo) => (photo.id === photoId ? { ...photo, comments: photo.comments } : photo)))
    }
  }

  const toggleFavorite = async (photoId: string) => {
    // Actualizar estado local inmediatamente para feedback
    const updatedPhotos = [...photos]
    const photoIndex = updatedPhotos.findIndex(p => p.id === photoId)
    const currentIsFavorite = updatedPhotos[photoIndex]?.isFavorite || false
    const newIsFavorite = !currentIsFavorite
    
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, isFavorite: newIsFavorite } : photo)),
    )
    
    // Enviar a la API
    try {
      const response = await fetch('/api/photos/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, isFavorite: newIsFavorite })
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar favorito')
      }
      
      console.log(`Favorito actualizado para foto ${photoId}: ${newIsFavorite}`)
    } catch (error) {
      console.error('Error al actualizar favorito:', error)
      // Revertir cambio local si falla la API
      setPhotos((prev) => prev.map((photo) => (photo.id === photoId ? { ...photo, isFavorite: currentIsFavorite } : photo)))
    }
  }

  const startComparison = () => {
    if (selectedPhotos.length >= 2) {
      setShowComparison(true)
    }
  }

  // Funciones para selección múltiple
  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId)
      } else {
        // Permitir selección ilimitada para acciones masivas
        // Solo limitar a 4 cuando se muestre el botón de comparar
        return [...prev, photoId]
      }
    })
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
    // Solo bloquear si se hizo clic específicamente en elementos de rating o botones
    const target = e.target as HTMLElement
    
    // Permitir drag en imágenes, pero bloquear clicks en controles específicos
    if (target.closest('button') ||
        target.closest('[role="button"]') ||
        // Solo bloquear SVGs que están dentro del componente StarRating (estrellas y X)
        (target.tagName === 'svg' && target.classList.contains('cursor-pointer')) ||
        (target.closest('svg') && target.closest('svg')?.classList.contains('cursor-pointer'))) {
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

    // Calcular desplazamiento para decidir si realmente hubo drag
    const dragDelta = Math.max(
      Math.abs(dragEnd.x - dragStart.x),
      Math.abs(dragEnd.y - dragStart.y)
    )
    const didDrag = dragDelta > 5 // Umbral de 5px

    setWasDragging(didDrag)
    // Si hubo drag significativo, resetear wasDragging tras breve delay
    if (didDrag) {
      setTimeout(() => setWasDragging(false), 100)
    }
  }

  // Efecto para cerrar acciones masivas cuando no hay fotos seleccionadas
  useEffect(() => {
    if (selectedPhotos.length === 0 && showBulkActions) {
      setShowBulkActions(false)
    }
  }, [selectedPhotos.length, showBulkActions])

  const applyBulkRating = async (rating: number) => {
    const promises = selectedPhotos.map(photoId => updatePhotoRating(photoId, rating))
    await Promise.all(promises)
  }

  const applyBulkColorTag = async (colorTag: string | null) => {
    const promises = selectedPhotos.map(photoId => updatePhotoColorTag(photoId, colorTag))
    await Promise.all(promises)
  }

  const applyBulkFavorite = async (isFavorite: boolean) => {
    // Actualizar estado local
    setPhotos(prev => prev.map(photo => 
      selectedPhotos.includes(photo.id) ? { ...photo, isFavorite } : photo
    ))
    
    // Enviar a la API
    const promises = selectedPhotos.map(async (photoId) => {
      try {
        const response = await fetch('/api/photos/favorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId, isFavorite })
        })
        if (!response.ok) throw new Error('Error al actualizar favorito')
      } catch (error) {
        console.error('Error al actualizar favorito:', error)
      }
    })
    
    await Promise.all(promises)
  }

  const handleUpdatePhotoInComparison = async (photoId: string, updates: any) => {
    // Actualizar estado local inmediatamente para feedback
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, ...updates, isReviewed: true } : photo
    ))
    
    // Enviar actualizaciones a la API
    try {
      const promises = []
      
      // Actualizar rating si está presente
      if (updates.rating !== undefined) {
        promises.push(
          fetch('/api/photos/rating', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoId, rating: updates.rating })
          })
        )
      }
      
      // Actualizar colorTag si está presente
      if (updates.colorTag !== undefined) {
        promises.push(
          fetch('/api/photos/color-tag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoId, colorTag: updates.colorTag })
          })
        )
      }
      
      // Actualizar comentarios si están presentes
      if (updates.comments !== undefined) {
        promises.push(
          fetch('/api/photos/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoId, comment: updates.comments })
          })
        )
      }
      
      // Actualizar favorito si está presente
      if (updates.isFavorite !== undefined) {
        promises.push(
          fetch('/api/photos/favorite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoId, isFavorite: updates.isFavorite })
          })
        )
      }
      
      // Ejecutar todas las peticiones
      const responses = await Promise.all(promises)
      
      // Verificar que todas las peticiones fueron exitosas
      responses.forEach(response => {
        if (!response.ok) {
          throw new Error(`Error en petición: ${response.status}`)
        }
      })
      
      console.log(`Foto actualizada exitosamente: ${photoId}`, updates)
    } catch (error) {
      console.error('Error al actualizar foto:', error)
      // Revertir cambios si fallan las peticiones
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId ? { ...photo, ...updates, isReviewed: photo.isReviewed } : photo
      ))
    }
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
          // Toggle favorito: si alguna foto no es favorita, marcar todas como favoritas
          // Si todas son favoritas, desmarcar todas
          const currentlyFavoritePhotos = photos.filter(photo => 
            selectedPhotos.includes(photo.id) && photo.isFavorite
          )
          const shouldMarkAsFavorite = currentlyFavoritePhotos.length < selectedPhotos.length
          applyBulkFavorite(shouldMarkAsFavorite)
          break
        case 'Escape':
          clearSelection()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhotos.length, applyBulkRating, applyBulkColorTag, applyBulkFavorite, clearSelection, photos])

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
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} cursor-pointer transition-colors ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LecorralHeader>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="text-left lg:text-right">
            <p className="text-sm text-muted-foreground">
              {sessionData?.clientName || 'Cliente'} • {sessionData?.location || 'Sesión'}
            </p>
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
          </div>
        </div>
      </LecorralHeader>

      {/* Controls */}
      <div className="bg-background border-b">
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
                
                {selectedPhotos.length >= 2 && selectedPhotos.length <= 4 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={startComparison}
                    className="gap-2"
                    title="Comparar fotos seleccionadas lado a lado (2-4 fotos)"
                  >
                    <Copy className="w-4 h-4" />
                    Comparar ({selectedPhotos.length})
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
                

                
                <Button
                  variant={isFullWidth ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsFullWidth(!isFullWidth)}
                  className="gap-2"
                  title={isFullWidth ? "Vista compacta" : "Ancho completo"}
                >
                  {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  {isFullWidth ? "Compacto" : "Completo"}
                </Button>
                
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

              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Columnas:</span>
                <Select value={gridColumns.toString()} onValueChange={(value) => setGridColumns(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((cols) => (
                      <SelectItem key={cols} value={cols.toString()}>
                        {cols}
                      </SelectItem>
                    ))}
                  </SelectContent>
                                  </Select>
                
                <div className="h-4 w-px bg-border mx-2" />
                
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

      {/* Bulk Actions Panel */}
      {selectedPhotos.length > 0 && showBulkActions && (
        <div className="bg-secondary/50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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
      <div className={`${isFullWidth ? 'w-full' : 'max-w-7xl'} mx-auto px-4 py-6`}>
        {viewMode === "grid" ? (
          <div 
            className="grid gap-4 relative select-none"
            style={{ 
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` 
            }}
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
                  {/* Contenedor de imagen con aspect ratio fijo */}
                  <div className="aspect-[4/3] relative bg-muted/20 rounded-t-lg">
                    <Image
                      src={photo.url || "/placeholder.svg"}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-contain cursor-pointer"
                      onMouseDown={(e) => {
                        // No hacer nada aquí, dejar que propague al grid
                      }}
                      onClick={(e) => {
                        if (wasDragging) {
                          e.preventDefault()
                          e.stopPropagation()
                          return
                        }
                        
                        if (e.ctrlKey) {
                          e.preventDefault()
                          e.stopPropagation()
                          togglePhotoSelection(photo.id)
                        } else {
                          setSelectedPhoto(index)
                          setShowSlideshow(true)
                        }
                      }}
                    />

                    {/* Indicadores sutiles */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {photo.colorTag && (
                        <div
                          className={`w-5 h-5 rounded-full ${colorTags.find((t) => t.value === photo.colorTag)?.color}`}
                        />
                      )}
      
                    </div>
                  </div>

                  {/* Rating y controles - siempre debajo */}
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

                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedPhoto(index);
                        setShowSlideshow(true);
                      }} className="p-1">
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
                    <div className="relative">
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={`Foto ${index + 1}`}
                        width={400}
                        height={600}
                        className="w-full h-auto object-contain rounded-lg cursor-pointer"
                        onClick={(e) => {
                          if (e.ctrlKey) {
                            // CTRL + Click para selección múltiple
                            e.preventDefault();
                            togglePhotoSelection(photo.id);
                          } else {
                            // Click normal abre slideshow
                            setSelectedPhoto(index);
                            setShowSlideshow(true);
                          }
                        }}
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
                            <label className="text-sm font-medium mb-2 block">
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



      {/* Modal de Comparación */}
      {showComparison && (
        <PhotoComparison
          photos={selectedPhotos.slice(0, 4).map(id => {
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
            clearSelection()
          }}
          onUpdatePhoto={handleUpdatePhotoInComparison}
        />
      )}

      {/* Modal de Slideshow */}
      <Slideshow
        photos={filteredPhotos.map(photo => ({
          id: photo.id,
          url: photo.url,
          rating: photo.rating || 3, // Rating base 1 estrellas (1-5), default 3
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
              photo.id === photoId ? { ...photo, ...updates } : photo
            )
          )
        }}
      />

      {/* Diálogo de Exportación */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        session={{
          id: sessionData?.id || '',
          clientName: sessionData?.clientName || '',
          photographer: sessionData?.photographer || '',
          date: sessionData?.date || '',
          location: sessionData?.location || ''
        }}
        photos={photos.map(photo => ({
          id: photo.id,
          filename: photo.filename,
          rating: photo.rating,
          isFavorite: photo.isFavorite,
          colorTag: photo.colorTag,
          comments: photo.comments,
          isReviewed: photo.isReviewed
        }))}
      />

      {/* Botón Finalizar: copia reporte al portapapeles */}
      <div className="flex justify-end max-w-7xl mx-auto px-4 pb-10">
        <Button
          variant="default"
          onClick={() => {
            // Construir lista de nombres separados por espacios
            const filenames = photos.map(p => p.filename || p.id).join(' ')

            // Construir tabla HTML
            const rows = photos.map(p => {
              const fav = p.isFavorite ? 'Sí' : 'No'
              const tag = p.colorTag || '-'
              const comments = (p.comments || '').replace(/\n/g, '<br/>').replace(/"/g, '&quot;')
              return `<tr><td>${p.filename || p.id}</td><td>${p.rating}</td><td>${tag}</td><td>${fav}</td><td>${comments}</td></tr>`
            }).join('\n')

            const table = `<table border="1" cellpadding="4" cellspacing="0"><thead><tr><th>Nombre</th><th>Rating</th><th>Etiqueta</th><th>Favorita</th><th>Comentarios</th></tr></thead><tbody>${rows}</tbody></table>`

            const report = `${filenames}\n\n${table}`

            navigator.clipboard.writeText(report).then(() => {
              alert('Reporte copiado al portapapeles')
            }).catch(() => {
              alert('No se pudo copiar el reporte')
            })
          }}
        >
          Finalizar (copiar reporte)
        </Button>
      </div>
    </div>
  )
}
