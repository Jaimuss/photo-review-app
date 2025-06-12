import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    // En producción, aquí obtendrías las sesiones del fotógrafo autenticado
    const sessions = [
      {
        id: "session-001",
        clientName: "María González",
        date: "15 de Enero, 2024",
        location: "Sesión Familiar - Parque Central",
        totalPhotos: 48,
        reviewedPhotos: 12,
        accessToken: "demo-token-123",
        status: "active",
      },
      {
        id: "session-002",
        clientName: "Carlos Rodríguez",
        date: "20 de Enero, 2024",
        location: "Sesión de Pareja - Playa",
        totalPhotos: 32,
        reviewedPhotos: 32,
        accessToken: "demo-token-456",
        status: "completed",
      },
      {
        id: "session-003",
        clientName: "Ana Martínez",
        date: "10 de Enero, 2024",
        location: "Sesión Individual - Estudio",
        totalPhotos: 25,
        reviewedPhotos: 25,
        accessToken: "demo-token-789",
        status: "archived",
      },
    ]

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching photographer sessions:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { clientName, clientEmail, location, date, notes } = await request.json()

    if (!clientName || !location || !date) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Generar token de acceso único
    const accessToken = `${clientName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`

    const sessionData = {
      clientName,
      photographer: "Studio Pro", // En producción vendría del usuario autenticado
      date: new Date(date).toLocaleDateString("es-ES"),
      location,
      accessToken,
      status: "active" as const,
    }

    const session = await db.createSession(sessionData)

    return NextResponse.json({
      sessionId: session.id,
      accessToken: session.accessToken,
      message: "Sesión creada correctamente",
    })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
