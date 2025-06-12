'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, FolderOpen, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UploadZone } from '@/components/upload-zone'
import { ModeToggle } from '@/components/mode-toggle'
import { useToast } from '@/components/ui/use-toast'

interface SessionData {
  id: string
  clientName: string
  location: string
  photographer: string
  totalPhotos: number
  reviewedPhotos: number
}

export default function UploadPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const { toast } = useToast()
  
  const [uploadedCount, setUploadedCount] = useState(0)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setSessionData({
            id: data.session.id,
            clientName: data.session.clientName,
            location: data.session.location,
            photographer: data.session.photographer || 'Studio Pro',
            totalPhotos: data.photos?.length || 0,
            reviewedPhotos: data.photos?.filter((p: any) => p.isReviewed).length || 0
          })
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de la sesión',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchSessionData()
    }
  }, [sessionId, toast])

  const handleUploadComplete = (files: any[]) => {
    setUploadedCount(prev => prev + files.length)
    
    toast({
      title: '¡Fotos subidas!',
      description: `${files.length} fotos añadidas a la sesión`,
    })

    // Actualizar datos de la sesión
    if (sessionData) {
      setSessionData(prev => prev ? {
        ...prev,
        totalPhotos: prev.totalPhotos + files.length
      } : null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              <h1 className="text-xl font-bold">Photo Review App</h1>
            </div>
            <ModeToggle />
          </div>
        </header>
        <main className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando sesión...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            <h1 className="text-xl font-bold">Photo Review App</h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sesiones</span>
              <span>/</span>
              <span className="text-foreground font-medium">
                {sessionData?.clientName || 'Cargando...'}
              </span>
              <span>/</span>
              <span className="text-foreground font-medium">Subir Fotos</span>
            </div>
          </div>

          {/* Header de la sesión */}
          {sessionData && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      {sessionData.clientName}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">{sessionData.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      {sessionData.totalPhotos} fotos
                    </Badge>
                    {sessionData.reviewedPhotos > 0 && (
                      <Badge variant="outline">
                        {sessionData.reviewedPhotos} revisadas
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Zona de subida */}
          <Card>
            <CardHeader>
              <CardTitle>Subir Fotos a la Sesión</CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Las fotos se optimizarán automáticamente y se generarán thumbnails
                </p>
                {uploadedCount > 0 && (
                  <Badge variant="default">
                    +{uploadedCount} fotos en esta sesión
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <UploadZone 
                sessionId={sessionId} 
                onUploadComplete={handleUploadComplete}
              />
              
              <div className="flex gap-4 mt-8 pt-6 border-t">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/dashboard">
                    Terminar más tarde
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={`/session/${sessionId}?code=demo-token-123`}>
                    Ver Sesión como Cliente
                  </Link>
                </Button>
                <Button variant="secondary" asChild className="flex-1">
                  <Link href="/dashboard">
                    Volver al Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">💡 Consejos para la subida</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Las imágenes se optimizan automáticamente para web</li>
                <li>• Se generan thumbnails para navegación rápida</li>
                <li>• Formatos soportados: JPEG, PNG, WebP, HEIC, RAW</li>
                <li>• Tamaño máximo: 50MB por archivo</li>
                <li>• Puedes subir múltiples archivos arrastrándolos</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 