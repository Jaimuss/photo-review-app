import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

// Fuerza este handler a ejecutarse en Node.js (no Edge) para que `params` sea síncrono
export const runtime = "nodejs"

// En Next.js 15, params es siempre una Promise
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params

    // Obtener datos reales de la base de datos
    const session = await database.getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const photos = await database.getSessionPhotos(sessionId)
    const stats = await database.getSessionStats(sessionId)

    const sessionData = {
      session: {
        id: sessionId,
        clientName: session.clientName || "Cliente",
        photographer: "Fotógrafo", // TODO: Join con photographers table
        date: session.sessionDate ? new Date(session.sessionDate).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : new Date().toLocaleDateString('es-ES'),
        location: session.location || "Sesión fotográfica",
        totalPhotos: stats.totalPhotos,
        reviewedPhotos: stats.reviewedPhotos,
      },
      photos: photos.map(photo => ({
        id: photo.id,
        url: photo.url,
        rating: photo.rating || 3,
        isFavorite: photo.isFavorite || false,
        colorTag: photo.colorTag,
        comments: photo.comments || "",
        isReviewed: photo.isReviewed || false,
        filename: photo.filename
      })),
      stats
    }

    return NextResponse.json(sessionData)
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
}
