"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Camera, ArrowLeft, Calendar } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { LecorralHeader } from "@/components/lecorral-header"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function NewSessionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    location: "",
    date: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clientName || !formData.location || !formData.date) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/photographer/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Error al crear la sesión")
      }

      const data = await response.json()

      toast({
        title: "Sesión creada",
        description: `Código de acceso: ${data.accessToken}`,
      })

      // Redirigir al dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error creating session:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <LecorralHeader />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Nueva Sesión Fotográfica</h1>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Detalles de la Sesión</CardTitle>
                <CardDescription>Completa la información para crear una nueva sesión fotográfica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Nombre de la Sesión *</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Ej: Sesión Familiar - Parque Central"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nombre del Cliente *</Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      placeholder="Ej: María González"
                      value={formData.clientName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email del Cliente</Label>
                    <Input
                      id="clientEmail"
                      name="clientEmail"
                      type="email"
                      placeholder="cliente@email.com"
                      value={formData.clientEmail}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha de la Sesión *</Label>
                    <div className="relative">
                      <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Información adicional sobre la sesión..."
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" asChild className="flex-1">
                    <Link href="/dashboard">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Creando..." : "Crear Sesión"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
