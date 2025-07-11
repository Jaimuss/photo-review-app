"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star, Camera, UserPlus, Lock, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ModeToggle } from "@/components/mode-toggle"

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
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState("")
  const [session, setSession] = useState<Session | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid")
  const [filterRating, setFilterRating] = useState<string>("all")
  const [filterColor, setFilterColor] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([])

  // Actualizar la función handleClientAccess para usar la ruta correcta
  const handleClientAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/sessions/access?code=${encodeURIComponent(accessCode)}`)

      if (response.ok) {
        const data = await response.json()
        // Cambiar la ruta para usar la nueva estructura
        router.push(`/session/${data.sessionId}`)
      } else {
        const error = await response.json()
        setError(error.message || "Código de acceso inválido")
      }
    } catch (err) {
      setError("Error al verificar el código de acceso")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotographerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        // Usar window.location para forzar la redirección
        window.location.href = '/dashboard'
      } else {
        const error = await response.json()
        toast({
          title: 'Error de login',
          description: error.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al iniciar sesión',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Simular carga de datos del backend
  useEffect(() => {
    loadSessionData()
  }, [])

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
      // Llamada a nuestra API local
      const response = await fetch("/api/sessions/demo")
      const data = await response.json()

      setSession(data.session)
      setPhotos(data.photos)
    } catch (error) {
      console.error("Error loading session:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePhotoRating = async (photoId: string, rating: number) => {
    try {
      const response = await fetch("/api/photos/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, rating }),
      })

      if (response.ok) {
        setPhotos((prev) =>
          prev.map((photo) => (photo.id === photoId ? { ...photo, rating, isReviewed: true } : photo)),
        )
      }
    } catch (error) {
      console.error("Error updating rating:", error)
    }
  }

  const updatePhotoColorTag = async (photoId: string, colorTag: string | null) => {
    try {
      const response = await fetch("/api/photos/color-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, colorTag }),
      })

      if (response.ok) {
        setPhotos((prev) =>
          prev.map((photo) => (photo.id === photoId ? { ...photo, colorTag, isReviewed: true } : photo)),
        )
      }
    } catch (error) {
      console.error("Error updating color tag:", error)
    }
  }

  const updatePhotoComment = async (photoId: string, comment: string) => {
    try {
      const response = await fetch("/api/photos/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, comment }),
      })

      if (response.ok) {
        setPhotos((prev) =>
          prev.map((photo) => (photo.id === photoId ? { ...photo, comments: comment, isReviewed: true } : photo)),
        )
      }
    } catch (error) {
      console.error("Error updating comment:", error)
    }
  }

  const toggleFavorite = async (photoId: string) => {
    try {
      const photo = photos.find((p) => p.id === photoId)
      const response = await fetch("/api/photos/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isFavorite: !photo?.isFavorite }),
      })

      if (response.ok) {
        setPhotos((prev) =>
          prev.map((photo) => (photo.id === photoId ? { ...photo, isFavorite: !photo.isFavorite } : photo)),
        )
      }
    } catch (error) {
      console.error("Error updating favorite:", error)
    }
  }

  const exportReport = async () => {
    try {
      const response = await fetch("/api/sessions/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session?.id }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-${session?.clientName}-${new Date().toISOString().split("T")[0]}.pdf`
      a.click()
    } catch (error) {
      console.error("Error exporting report:", error)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error al cargar la sesión</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            <h1 className="text-xl font-bold">Photo Review App</h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Plataforma de Revisión de Fotografías</h1>
            <p className="text-xl text-muted-foreground">
              Revisa, califica y selecciona tus fotos favoritas de manera sencilla e interactiva
            </p>
          </div>

          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client">Acceso Cliente</TabsTrigger>
              <TabsTrigger value="photographer">Fotógrafo</TabsTrigger>
            </TabsList>

            <TabsContent value="client">
              <Card>
                <CardHeader>
                  <CardTitle>Acceso a tu Sesión</CardTitle>
                  <CardDescription>Ingresa el código de acceso que recibiste de tu fotógrafo</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleClientAccess} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="accessCode">Código de Acceso</Label>
                      <Input
                        id="accessCode"
                        placeholder="Ej: ABC123"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Verificando..." : "Acceder a mi Sesión"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photographer">
              <Card>
                <CardHeader>
                  <CardTitle>Área de Fotógrafos</CardTitle>
                  <CardDescription>Accede a tu cuenta para gestionar sesiones y clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePhotographerLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="tu@email.com" 
                        defaultValue="demo@example.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input 
                        id="password" 
                        name="password"
                        type="password" 
                        defaultValue="password" 
                      />
                      <p className="text-xs text-muted-foreground">
                        Demo: demo@example.com / password
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>

                    <div className="flex justify-between items-center pt-4">
                      <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Registrarse
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Lock className="h-4 w-4" />
                        Olvidé mi contraseña
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Photo Review App. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
