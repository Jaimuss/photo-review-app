'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'

interface UploadZoneProps {
  sessionId: string
  onUploadComplete?: (files: any[]) => void
}

export function UploadZone({ sessionId, onUploadComplete }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setProgress(0)
    setErrors([])
    setUploadedFiles([])

    try {
      const formData = new FormData()
      acceptedFiles.forEach(file => {
        formData.append('files', file)
      })

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(`/api/sessions/${sessionId}/upload`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadedFiles(result.files || [])
      
      onUploadComplete?.(result.files || [])
      
      toast({
        title: 'Subida completada',
        description: `${result.uploaded} fotos subidas correctamente`,
      })

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setErrors([errorMessage])
      
      toast({
        title: 'Error en la subida',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }, [sessionId, onUploadComplete])

  const dropzoneOptions = {
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic', '.tiff']
    },
    multiple: true,
    disabled: uploading,
    maxSize: 50 * 1024 * 1024, // 50MB por archivo
  }

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone(dropzoneOptions)

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-lg">Suelta las fotos aquí...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">Arrastra fotos aquí o haz clic para seleccionar</p>
            <p className="text-sm text-muted-foreground mb-2">
              Soporta JPEG, PNG, WebP, HEIC, TIFF. Múltiples archivos permitidos.
            </p>
            <p className="text-xs text-muted-foreground">
              Tamaño máximo: 50MB por archivo
            </p>
          </div>
        )}
      </div>

      {/* Errores de archivos rechazados */}
      {fileRejections && fileRejections.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              Archivos rechazados:
            </span>
          </div>
          <ul className="text-sm text-destructive space-y-1">
            {fileRejections.map((rejection, index) => (
              <li key={index}>
                {rejection.file.name} - {rejection.errors[0]?.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Errores de la subida */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              Errores de subida:
            </span>
          </div>
          <ul className="text-sm text-destructive space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Barra de progreso */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo fotos...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Fotos subidas exitosamente */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">
              {uploadedFiles.length} fotos subidas correctamente
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img 
                  src={file.thumbnailUrl || "/placeholder.svg"} 
                  alt={file.filename}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-green-500 bg-white rounded-full" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white bg-black/50 rounded px-1 py-0.5 truncate">
                    {file.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 