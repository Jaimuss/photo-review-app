'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, X, Settings, Heart, MessageSquare, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

interface Photo {
  id: string
  url: string
  rating: number
  isFavorite: boolean
  colorTag: string | null
  comments?: string
}

interface SlideshowProps {
  photos: Photo[]
  isOpen: boolean
  onClose: () => void
  startIndex?: number
  onUpdatePhoto?: (photoId: string, updates: any) => void
}

export function Slideshow({ photos, isOpen, onClose, startIndex = 0, onUpdatePhoto }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(3000) // 3 segundos
  const [transition, setTransition] = useState('fade')
  const [showControls, setShowControls] = useState(true)
  const [editingComment, setEditingComment] = useState(false)
  const [tempComment, setTempComment] = useState('')
  const intervalRef = useRef<NodeJS.Timeout>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [startIndex])

  useEffect(() => {
    if (isPlaying && photos.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % photos.length)
      }, speed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, speed, photos.length])

  useEffect(() => {
    if (showControls) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [showControls])

  const nextPhoto = () => {
    setCurrentIndex(prev => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length)
  }

  const handleMouseMove = () => {
    setShowControls(true)
    // Auto-ocultar después de 3 segundos
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const updateRating = (rating: number) => {
    const validIndex = Math.max(0, Math.min(currentIndex, photos.length - 1))
    const currentPhoto = photos[validIndex]
    if (onUpdatePhoto && currentPhoto) {
      onUpdatePhoto(currentPhoto.id, { rating })
      // Update local state for immediate feedback
      photos[validIndex].rating = rating
    }
  }

  const toggleFavorite = () => {
    const validIndex = Math.max(0, Math.min(currentIndex, photos.length - 1))
    const currentPhoto = photos[validIndex]
    if (onUpdatePhoto && currentPhoto) {
      onUpdatePhoto(currentPhoto.id, { isFavorite: !currentPhoto.isFavorite })
      // Update local state for immediate feedback
      photos[validIndex].isFavorite = !currentPhoto.isFavorite
    }
  }

  const setColorTag = (colorTag: string | null) => {
    const validIndex = Math.max(0, Math.min(currentIndex, photos.length - 1))
    const currentPhoto = photos[validIndex]
    if (onUpdatePhoto && currentPhoto) {
      onUpdatePhoto(currentPhoto.id, { colorTag })
      // Update local state for immediate feedback
      photos[validIndex].colorTag = colorTag
    }
  }

  const startEditingComment = () => {
    const validIndex = Math.max(0, Math.min(currentIndex, photos.length - 1))
    const currentPhoto = photos[validIndex]
    if (currentPhoto) {
      setTempComment(currentPhoto.comments || '')
      setEditingComment(true)
      setIsPlaying(false) // Pausar slideshow mientras se edita
    }
  }

  const saveComment = () => {
    const validIndex = Math.max(0, Math.min(currentIndex, photos.length - 1))
    const currentPhoto = photos[validIndex]
    if (onUpdatePhoto && currentPhoto) {
      onUpdatePhoto(currentPhoto.id, { comments: tempComment })
      // Update local state for immediate feedback
      photos[validIndex].comments = tempComment
    }
    setEditingComment(false)
  }

  const cancelEditingComment = () => {
    setEditingComment(false)
    setTempComment('')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // Si estamos editando comentario, manejar solo las teclas específicas
    if (editingComment) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          saveComment()
          break
        case 'Escape':
          e.preventDefault()
          cancelEditingComment()
          break
      }
      return
    }

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault()
        nextPhoto()
        break
      case 'ArrowLeft':
        e.preventDefault()
        prevPhoto()
        break
      case 'Escape':
        onClose()
        break
      case 'p':
      case 'P':
        setIsPlaying(!isPlaying)
        break
      case '1':
        updateRating(1)
        break
      case '2':
        updateRating(2)
        break
      case '3':
        updateRating(3)
        break
      case '4':
        updateRating(4)
        break
      case '5':
        updateRating(5)
        break
      case '0':
        updateRating(0)
        break
      case 'f':
      case 'F':
        toggleFavorite()
        break
      case 'c':
      case 'C':
        startEditingComment()
        break
      case 's':
      case 'S':
        setColorTag('green')
        break
      case 'r':
      case 'R':
        setColorTag('yellow')
        break
      case 'd':
      case 'D':
        setColorTag('red')
        break
      case 'n':
      case 'N':
        setColorTag(null) // Sin etiqueta
        break
    }
  }

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }
  }, [isOpen, isPlaying, editingComment, currentIndex])

  if (!isOpen || photos.length === 0) return null

  // Validar que currentIndex esté dentro del rango válido
  const validIndex = Math.max(0, Math.min(currentIndex, photos.length - 1))
  const currentPhoto = photos[validIndex]
  
  // Si no hay foto válida, no mostrar el slideshow
  if (!currentPhoto) return null

  const getColorTagColor = (colorTag: string | null) => {
    switch (colorTag) {
      case 'green': return '#22c55e'
      case 'yellow': return '#eab308'
      case 'red': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-full p-0 bg-background">
        <VisuallyHidden.Root>
          <DialogTitle>Slideshow de Fotos</DialogTitle>
        </VisuallyHidden.Root>
        <div 
          className="relative w-screen h-screen flex items-center justify-center"
          onMouseMove={handleMouseMove}
        >
          {/* Imagen principal */}
          <div className="relative w-full h-full">
            <Image
              src={currentPhoto.url || "/placeholder.svg"}
              alt={`Foto ${validIndex + 1}`}
              fill
              className={`object-contain transition-opacity duration-500 ${
                transition === 'fade' ? 'opacity-100' : ''
              }`}
              priority
            />
          </div>

          {/* Controles */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 dark:from-black/50 to-transparent p-6 z-50">
              <div className="flex justify-between items-center text-white dark:text-white">
                <div>
                  <h2 className="text-xl font-semibold">Slideshow</h2>
                  <p className="text-sm opacity-75">
                    {validIndex + 1} de {photos.length}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white dark:text-white hover:bg-white/20 dark:hover:bg-white/20 z-50">
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Navegación lateral */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={prevPhoto}
                className="text-white dark:text-white bg-black/20 dark:bg-black/20 hover:bg-black/40 dark:hover:bg-black/40"
              >
                <SkipBack className="w-6 h-6" />
              </Button>
            </div>

            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextPhoto}
                className="text-white dark:text-white bg-black/20 dark:bg-black/20 hover:bg-black/40 dark:hover:bg-black/40"
              >
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>

            {/* Controles inferiores */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 dark:from-black/50 to-transparent p-6">
              <div className="flex items-center justify-center gap-4 text-white dark:text-white mb-4">
                                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white dark:text-white hover:bg-white/20 dark:hover:bg-white/20"
                  >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <div className="flex items-center gap-4">
                  <span className="text-sm">Velocidad:</span>
                  <Select value={speed.toString()} onValueChange={(value) => setSpeed(Number(value))}>
                    <SelectTrigger className="w-32 bg-background/20 dark:bg-black/20 border-border dark:border-white/20 text-foreground dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">Rápido (1s)</SelectItem>
                      <SelectItem value="2000">Normal (2s)</SelectItem>
                      <SelectItem value="3000">Lento (3s)</SelectItem>
                      <SelectItem value="5000">Muy lento (5s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm">Transición:</span>
                  <Select value={transition} onValueChange={setTransition}>
                    <SelectTrigger className="w-32 bg-background/20 dark:bg-black/20 border-border dark:border-white/20 text-foreground dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Indicadores de progreso */}
              <div className="flex justify-center gap-1 max-w-screen-md mx-auto overflow-x-auto pb-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
                      index === currentIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Información de la foto - Siempre visible de forma discreta */}
          <div className="absolute top-20 right-6 bg-white/95 dark:bg-black/60 text-foreground dark:text-white p-3 rounded-lg max-w-sm transition-all duration-300 hover:bg-white dark:hover:bg-black/90 hover:scale-105 z-40 shadow-lg border border-border dark:border-transparent">
            <div className="space-y-3">
              {/* Rating interactivo */}
              <div className="space-y-1">
                <span className="text-sm font-medium">Rating (0-5):</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateRating(star)}
                      className={`w-6 h-6 transition-all hover:scale-110 ${
                        star <= currentPhoto.rating ? 'text-yellow-400' : 'text-gray-500'
                      }`}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                  <button
                    onClick={() => updateRating(0)}
                    className="w-6 h-6 transition-all hover:scale-110 text-red-400 ml-2"
                    title="Quitar rating"
                  >
                    <X className="w-full h-full" />
                  </button>
                </div>
              </div>

              {/* Favorito interactivo */}
              <div className="space-y-1">
                <span className="text-sm font-medium">Favorito (F):</span>
                <button
                  onClick={toggleFavorite}
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                    currentPhoto.isFavorite 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-muted dark:bg-gray-500/20 text-muted-foreground dark:text-gray-400 hover:bg-muted/80 dark:hover:bg-gray-400/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${currentPhoto.isFavorite ? 'fill-current' : ''}`} />
                  <span className="text-sm">
                    {currentPhoto.isFavorite ? 'Favorita' : 'Marcar favorita'}
                  </span>
                </button>
              </div>

              {/* Comentarios */}
              <div className="space-y-1">
                <span className="text-sm font-medium">Comentario (C):</span>
                {editingComment ? (
                  <div className="space-y-2">
                    <Textarea
                      value={tempComment}
                      onChange={(e) => setTempComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          saveComment()
                        }
                      }}
                      placeholder="Agregar comentario..."
                      className="bg-white dark:bg-black/50 border-input dark:border-gray-600 text-foreground dark:text-white text-sm resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={saveComment}
                        className="bg-green-600 hover:bg-green-700 text-white dark:text-white text-xs px-2 py-1"
                      >
                        Guardar (Enter)
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEditingComment}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs px-2 py-1"
                      >
                        Cancelar (Esc)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={startEditingComment}
                    className="w-full text-left p-2 rounded bg-muted dark:bg-gray-500/20 hover:bg-muted/80 dark:hover:bg-gray-400/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">
                        {currentPhoto.comments || 'Agregar comentario...'}
                      </span>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Etiquetas de color interactivas */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Etiqueta de color:</span>
                <div className="space-y-1">
                  {[
                    { key: null, label: 'Sin etiqueta (N)', color: 'bg-gray-500' },
                    { key: 'green', label: 'Seleccionar (S)', color: 'bg-green-500' },
                    { key: 'yellow', label: 'Revisar (R)', color: 'bg-yellow-500' },
                    { key: 'red', label: 'Descartar (D)', color: 'bg-red-500' }
                  ].map((tag) => (
                    <button
                      key={tag.key || 'none'}
                      onClick={() => setColorTag(tag.key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                        currentPhoto.colorTag === tag.key 
                          ? `${tag.color} text-white shadow-lg` 
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                      {tag.label}
                      {currentPhoto.colorTag === tag.key && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Información de teclado - Solo aparece con ratón */}
          <div className={`absolute bottom-6 left-6 bg-black/90 text-white p-4 rounded-lg transition-all duration-300 text-xs ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          } max-w-xs`}>
            <div className="space-y-1">
              <div className="font-medium mb-2 text-yellow-400">⌨️ Controles de teclado:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>← → Navegar</div>
                <div>Espacio: Siguiente</div>
                <div>P: Play/Pause</div>
                <div>Esc: Salir</div>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="text-green-400 font-medium mb-1">🎯 Edición rápida:</div>
                <div className="grid grid-cols-2 gap-1">
                  <div>0: Quitar rating</div>
                  <div>1-5: Rating</div>
                  <div>F: Favorito</div>
                  <div>C: Comentario</div>
                  <div>S: Seleccionar</div>
                  <div>R: Revisar</div>
                  <div>D: Descartar</div>
                  <div>N: Sin etiqueta</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}