"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Camera,
  Users,
  FolderPlus,
  Settings,
  LogOut,
  Search,
  Plus,
  Calendar,
  Upload,
  MoreVertical,
  Bell,
  User,
  Eye,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { LecorralHeader } from "@/components/lecorral-header"
import { LecorralLogo } from "@/components/lecorral-logo"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/toaster"

interface Session {
  id: string
  clientName: string
  date: string
  location: string
  totalPhotos: number
  reviewedPhotos: number
  accessToken: string
  status: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simular carga de datos
    const loadSessions = async () => {
      try {
        const response = await fetch("/api/photographer/sessions")
        if (response.ok) {
          const data = await response.json()
          setSessions(data.sessions)
        }
      } catch (error) {
        console.error("Error loading sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [])

  const filteredSessions = sessions.filter(
    (session) =>
      session.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeSessions = filteredSessions.filter((session) => session.status === "active")
  const completedSessions = filteredSessions.filter((session) => session.status === "completed")
  const archivedSessions = filteredSessions.filter((session) => session.status === "archived")

  const handleCreateSession = () => {
    router.push("/dashboard/sessions/new")
  }

  const SessionCard = ({ session }: { session: Session }) => {
    const progressPercentage = (session.reviewedPhotos / session.totalPhotos) * 100

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{session.location}</CardTitle>
              <CardDescription>{session.clientName}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/sessions/${session.id}`)}>
                  Gestionar Sesión
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/session/${session.id}`)}>
                  Revisar Fotos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/sessions/${session.id}/edit`)}>
                  Editar sesión
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(`${window.location.origin}/client/access/${session.accessToken}`)
                  }
                >
                  Copiar enlace de cliente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/api/sessions/${session.id}/export`, "_blank")}>
                  Exportar reporte
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">Archivar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{session.date}</span>
            </div>
            <Badge variant={session.status === "active" ? "default" : "secondary"}>
              {session.status === "active" ? "Activa" : session.status === "completed" ? "Completada" : "Archivada"}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso de revisión</span>
              <span>
                {session.reviewedPhotos}/{session.totalPhotos}
              </span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <Button variant="outline" size="sm" onClick={() => router.push(`/session/${session.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              Revisar Fotos
            </Button>
            <Button size="sm" onClick={() => router.push(`/dashboard/sessions/${session.id}`)}>
              <Upload className="h-4 w-4 mr-2" />
              Gestionar Sesión
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r hidden md:block p-4">
        <div className="flex items-center gap-2 mb-8">
          <LecorralLogo size="sm" />
          <h1 className="text-xl font-bold">LECORRAL PICKER</h1>
        </div>

        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard">
              <FolderPlus className="h-5 w-5 mr-3" />
              Sesiones
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard/clients">
              <Users className="h-5 w-5 mr-3" />
              Clientes
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-5 w-5 mr-3" />
              Configuración
            </Link>
          </Button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Studio Pro</p>
              <p className="text-xs text-muted-foreground">studio@example.com</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/logout">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b">
          <div className="container py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold md:hidden">LECORRAL PICKER</h1>
            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar sesiones o clientes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateSession}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Sesión
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-auto">
                    {[1, 2, 3].map((i) => (
                      <DropdownMenuItem key={i} className="cursor-pointer p-4">
                        <div className="flex gap-4">
                          <Avatar>
                            <AvatarFallback>MG</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">María González ha revisado su sesión</p>
                            <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer justify-center font-medium">
                    Ver todas las notificaciones
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Studio Pro</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="flex w-full">
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Sesiones
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard/clients" className="flex w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Clientes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard/settings" className="flex w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/logout" className="flex w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Sesiones Fotográficas</h1>
          </div>

          <Tabs defaultValue="active">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Activas ({activeSessions.length})</TabsTrigger>
              <TabsTrigger value="completed">Completadas ({completedSessions.length})</TabsTrigger>
              <TabsTrigger value="archived">Archivadas ({archivedSessions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-2 w-full" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : activeSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay sesiones activas</h3>
                  <p className="text-muted-foreground mb-6">Crea una nueva sesión para comenzar</p>
                  <Button onClick={handleCreateSession}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Sesión
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-2 w-full" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : completedSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay sesiones completadas</h3>
                  <p className="text-muted-foreground">Las sesiones completadas aparecerán aquí</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-2 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                </div>
              ) : archivedSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {archivedSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay sesiones archivadas</h3>
                  <p className="text-muted-foreground">Las sesiones archivadas aparecerán aquí</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <Toaster />
    </div>
  )
}
