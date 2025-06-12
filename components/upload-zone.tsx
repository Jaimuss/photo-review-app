'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface UploadZoneProps {
  sessionId: string
  onUploadComplete?: (files: any[]) => void
}

interface UploadedFile {
  id: string
  filename: string
  originalUrl: string
  thumbnailUrl: string
  size: number
  type: string
}

export function UploadZone({ sessionId, onUploadComplete }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setProgress(0)
    setErrors([])

    try {
      const formData = new FormData()
      
      // Filtrar solo imágenes
      const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'))
      
      if (imageFiles.length === 0) {
        throw new Error('No se encontraron archivos de imagen válidos')
      }

      if (imageFiles.length !== acceptedFiles.length) {
        setErrors([`${acceptedFiles.length - imageFiles.length} archivos fueron omitidos (solo se permiten imágenes)`])
      }

      imageFiles.forEach(file => {
        formData.append('files', file)
      })

      // Simular progreso durante la subida
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`/api/sessions/${sessionId}/upload`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en la subida')
      }

      const result = await response.json()
      setUploadedFiles(prev => [...prev, ...result.files])
      onUploadComplete?.(result.files)
      
      toast({
        title: 'Subida completada',
        description: `${result.uploaded} fotos subidas correctamente`,
      })

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Error en la subida',
        description: error instanceof Error ? error.message : 'No se pudieron subir las fotos',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }, [sessionId, onUploadComplete, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic', '.raw']
    },
    multiple: true,
    disabled: uploading,
    maxSize: 50 * 1024 * 1024, // 50MB por archivo
  })

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Zona de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-primary bg-primary/10 scale-105' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <div>
            <p className="text-lg font-medium">Suelta las fotos aquí...</p>
            <p className="text-sm text-muted-foreground">Se procesarán automáticamente</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">Arrastra fotos aquí o haz clic para seleccionar</p>
            <p className="text-sm text-muted-foreground mb-2">
              Soporta JPEG, PNG, WebP, HEIC, RAW
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo 50MB por archivo • Múltiples archivos permitidos
            </p>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo y procesando fotos...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-muted-foreground">
            Generando thumbnails y optimizando imágenes...
          </p>
        </div>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <h4 className="font-medium text-destructive">Advertencias</h4>
          </div>
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive/80">{error}</p>
          ))}
        </div>
      )}

      {/* Preview de fotos subidas */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Fotos subidas ({uploadedFiles.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image 
                    src={file.thumbnailUrl || "/placeholder.svg"} 
                    alt={file.filename}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                </div>
                
                {/* Overlay con info */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 text-white hover:bg-white/20"
                    onClick={() => removeUploadedFile(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <div className="mt-auto">
                    <p className="text-xs text-white font-medium truncate">{file.filename}</p>
                    <p className="text-xs text-white/80">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                {/* Indicador de éxito */}
                <CheckCircle className="absolute top-2 left-2 h-5 w-5 text-green-500 bg-white rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {uploadedFiles.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>{uploadedFiles.length} fotos listas para revisión</span>
          </div>
          <span>{formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.size, 0))} total</span>
        </div>
      )}
    </div>
  )
} 