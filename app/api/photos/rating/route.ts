import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import { sendPhotoRatingEvent } from "@/lib/event-manager"

export async function POST(request: NextRequest) {
  try {
    const { photoId, rating } = await request.json()

    // Validación
    if (!photoId || (rating !== 0 && (rating < 1 || rating > 5))) {
      return NextResponse.json({ error: "Invalid photoId or rating" }, { status: 400 })
    }

    // Obtener sessionId para el evento
    const sessionId = await database.getSessionIdByPhotoId(photoId)
    if (!sessionId) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Actualizar en base de datos local
    await database.updatePhotoReview(photoId, { rating, isReviewed: true })

    // Enviar evento en tiempo real a todos los clientes de la sesión
    sendPhotoRatingEvent(sessionId, photoId, rating)

    console.log(`Updated rating for photo ${photoId}: ${rating} stars - Event sent to session ${sessionId}`)

    return NextResponse.json({
      success: true,
      photoId,
      rating,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating photo rating:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
