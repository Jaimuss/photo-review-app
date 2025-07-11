import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function GET() {
  try {
    // Obtener todas las sesiones de la base de datos
    const allSessions = await database.getAllSessions()
    
    // Enriquecer con estadísticas
    const sessionsWithStats = await Promise.all(
      allSessions.map(async (session: any) => {
        const stats = await database.getSessionStats(session.id)
        return {
          ...session,
          totalPhotos: stats.totalPhotos,
          reviewedPhotos: stats.reviewedPhotos,
          date: new Date(session.sessionDate || session.createdAt).toLocaleDateString('es-ES'),
        }
      })
    )

    return NextResponse.json({ sessions: sessionsWithStats })
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
    
    // Generar ID único para la sesión
    const sessionId = `session-${Date.now()}`

    const sessionData = {
      id: sessionId,
      photographerId: "demo-photographer", // En producción vendría del usuario autenticado
      clientName,
      location,
      sessionDate: new Date(date).toISOString().split('T')[0],
      accessToken,
    }

    // Crear sesión en la base de datos
    await database.createSession(sessionData)

    return NextResponse.json({
      sessionId: sessionId,
      accessToken: accessToken,
      message: "Sesión creada correctamente",
    })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
