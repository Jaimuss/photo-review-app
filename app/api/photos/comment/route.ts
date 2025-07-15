import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import { sendPhotoCommentEvent } from "@/lib/event-manager"

export async function POST(request: NextRequest) {
  try {
    const { photoId, comment } = await request.json()

    // Validación
    if (!photoId) {
      return NextResponse.json({ error: "Invalid photoId" }, { status: 400 })
    }

    // Obtener sessionId para el evento
    const sessionId = await database.getSessionIdByPhotoId(photoId)
    if (!sessionId) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Actualizar en base de datos local
    await database.updatePhotoReview(photoId, { comment, isReviewed: true })

    // Enviar evento en tiempo real a todos los clientes de la sesión
    sendPhotoCommentEvent(sessionId, photoId, comment)

    console.log(`Updated comment for photo ${photoId}: ${comment} - Event sent to session ${sessionId}`)

    return NextResponse.json({
      success: true,
      photoId,
      comment,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating photo comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
