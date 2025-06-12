'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Photo {
  id: string
  url: string
  rating: number
  isFavorite: boolean
  colorTag: string | null
}

interface SlideshowProps {
  photos: Photo[]
  isOpen: boolean
  onClose: () => void
  startIndex?: number
}

export function Slideshow({ photos, isOpen, onClose, startIndex = 0 }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(3000) // 3 segundos
  const [transition, setTransition] = useState('fade')
  const [showControls, setShowControls] = useState(true)
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
  }

  const handleKeyDown = (e: KeyboardEvent) => {
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
    }
  }

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isPlaying])

  if (!isOpen || photos.length === 0) return null

  const currentPhoto = photos[currentIndex]

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
      <DialogContent className="max-w-full max-h-full p-0 bg-black">
        <div 
          className="relative w-screen h-screen flex items-center justify-center"
          onMouseMove={handleMouseMove}
        >
          {/* Imagen principal */}
          <div className="relative w-full h-full">
            <Image
              src={currentPhoto.url || "/placeholder.svg"}
              alt={`Foto ${currentIndex + 1}`}
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
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-6">
              <div className="flex justify-between items-center text-white">
                <div>
                  <h2 className="text-xl font-semibold">Slideshow</h2>
                  <p className="text-sm opacity-75">
                    {currentIndex + 1} de {photos.length}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
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
                className="text-white bg-black/20 hover:bg-black/40"
              >
                <SkipBack className="w-6 h-6" />
              </Button>
            </div>

            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextPhoto}
                className="text-white bg-black/20 hover:bg-black/40"
              >
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>

            {/* Controles inferiores */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
              <div className="flex items-center justify-center gap-4 text-white mb-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <div className="flex items-center gap-4">
                  <span className="text-sm">Velocidad:</span>
                  <Select value={speed.toString()} onValueChange={(value) => setSpeed(Number(value))}>
                    <SelectTrigger className="w-32 bg-black/20 border-white/20 text-white">
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
                    <SelectTrigger className="w-32 bg-black/20 border-white/20 text-white">
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

          {/* Información de la foto */}
          <div className={`absolute top-20 right-6 bg-black/50 text-white p-4 rounded-lg transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          } max-w-xs`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`w-3 h-3 rounded-full ${
                        star <= currentPhoto.rating ? 'bg-yellow-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {currentPhoto.colorTag && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Etiqueta:</span>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getColorTagColor(currentPhoto.colorTag) }}
                  />
                </div>
              )}
              
              {currentPhoto.isFavorite && (
                <div className="text-sm text-red-400 flex items-center gap-1">
                  ❤️ <span>Favorita</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de teclado */}
          <div className={`absolute bottom-20 left-6 bg-black/50 text-white p-3 rounded-lg transition-opacity duration-300 text-xs ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="space-y-1">
              <div>← → Navegar</div>
              <div>Espacio: Siguiente</div>
              <div>P: Play/Pause</div>
              <div>Esc: Salir</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}