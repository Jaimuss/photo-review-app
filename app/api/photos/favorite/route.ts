import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import { sendPhotoFavoriteEvent } from "@/lib/event-manager"

export async function POST(request: NextRequest) {
  try {
    const { photoId, isFavorite } = await request.json()

    // Validación
    if (!photoId || typeof isFavorite !== "boolean") {
      return NextResponse.json({ error: "Invalid photoId or isFavorite" }, { status: 400 })
    }

    // Obtener sessionId para el evento
    const sessionId = await database.getSessionIdByPhotoId(photoId)
    if (!sessionId) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Actualizar en base de datos local
    await database.updatePhotoReview(photoId, { isFavorite, isReviewed: true })

    // Enviar evento en tiempo real a todos los clientes de la sesión
    sendPhotoFavoriteEvent(sessionId, photoId, isFavorite)

    console.log(`Updated favorite status for photo ${photoId}: ${isFavorite} - Event sent to session ${sessionId}`)

    return NextResponse.json({
      success: true,
      photoId,
      isFavorite,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating photo favorite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
