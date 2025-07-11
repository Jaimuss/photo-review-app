"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Camera, Upload, Users, FileImage, Trash2, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { UploadZone } from "@/components/upload-zone"
import { toast } from "@/components/ui/use-toast"
import { ModeToggle } from "@/components/mode-toggle"

interface Photo {
  id: string
  url: string
  filename?: string
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

export default function SessionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  
  const [session, setSession] = useState<Session | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadedCount, setUploadedCount] = useState(0)

  useEffect(() => {
    loadSessionData()
  }, [sessionId])

  const loadSessionData = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        setPhotos(data.photos || [])
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar la sesión",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading session:", error)
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (newFiles: any[]) => {
    setUploadedCount(prev => prev + newFiles.length)
    // Recargar datos después de subir
    loadSessionData()
    toast({
      title: "¡Fotos subidas!",
      description: `Se han subido ${newFiles.length} fotos nuevas`,
    })
  }

  const deletePhoto = async (photoId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta foto?")) return
    
    try {
      // TODO: Implementar API para eliminar foto
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      toast({
        title: "Foto eliminada",
        description: "La foto ha sido eliminada correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la foto",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sesión no encontrada</h1>
          <Button onClick={() => router.push("/dashboard")}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const progressPercentage = session.totalPhotos > 0 ? (session.reviewedPhotos / session.totalPhotos) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{session.location}</h1>
                <p className="text-muted-foreground mt-1">Cliente: {session.clientName}</p>
              </div>
              <div className="lg:hidden">
                <ModeToggle />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href={`/session/${sessionId}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver como Fotógrafo
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/session/${sessionId}?code=demo-token-123`}>
                    <Users className="w-4 h-4 mr-2" />
                    Ver como Cliente
                  </Link>
                </Button>
              </div>
              <div className="hidden lg:block">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Información de la Sesión */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Fotos</CardTitle>
              <FileImage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.totalPhotos}</div>
              <p className="text-xs text-muted-foreground">
                {uploadedCount > 0 && `+${uploadedCount} nuevas en esta sesión`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fotos Revisadas</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.reviewedPhotos}</div>
              <p className="text-xs text-muted-foreground">
                {progressPercentage.toFixed(0)}% completado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fecha de Sesión</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{session.date}</div>
              <p className="text-xs text-muted-foreground">
                Fotógrafo: {session.photographer}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progreso de Revisión */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fotos revisadas por el cliente</span>
                <span>{session.reviewedPhotos}/{session.totalPhotos}</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Subir Nuevas Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Subir Nuevas Fotos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Las fotos se optimizarán automáticamente. Revisa las existentes para evitar duplicados.
              </p>
            </CardHeader>
            <CardContent>
              <UploadZone 
                sessionId={sessionId} 
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>

          {/* Fotos Existentes - Miniaturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Fotos Existentes ({photos.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Miniaturas de las fotos ya subidas para evitar duplicados.
              </p>
            </CardHeader>
            <CardContent>
              {photos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay fotos subidas aún</p>
                  <p className="text-sm">Sube las primeras fotos usando el área de arriba</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 max-h-96 overflow-y-auto">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={photo.url || "/placeholder.svg"}
                          alt={photo.filename || `Foto ${photo.id}`}
                          fill
                          className="object-cover"
                        />
                        
                        {/* Overlay con información */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deletePhoto(photo.id)}
                              className="text-xs px-2 py-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Indicadores de estado */}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {photo.isFavorite && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">❤️</Badge>
                          )}
                          {photo.isReviewed && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">✓</Badge>
                          )}
                          {photo.colorTag && (
                            <div className={`w-3 h-3 rounded-full ${
                              photo.colorTag === 'green' ? 'bg-green-500' :
                              photo.colorTag === 'yellow' ? 'bg-yellow-500' :
                              photo.colorTag === 'red' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                          )}
                        </div>
                      </div>
                      
                      {/* Nombre del archivo (si existe) */}
                      {photo.filename && (
                        <p className="text-xs text-muted-foreground mt-1 truncate" title={photo.filename}>
                          {photo.filename}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Acciones */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/dashboard">
                  Volver al Dashboard
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href={`/session/${sessionId}`}>
                  Revisar Fotos (Modo Fotógrafo)
                </Link>
              </Button>
              <Button variant="secondary" asChild className="flex-1">
                <Link href={`/session/${sessionId}?code=demo-token-123`}>
                  Compartir con Cliente
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 