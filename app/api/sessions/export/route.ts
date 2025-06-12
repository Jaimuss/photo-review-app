import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Obtener datos de la sesión
    const session = await database.getSession(sessionId)
    const photos = await database.getSessionPhotos(sessionId)

    // Generar estadísticas
    const stats = {
      totalPhotos: photos.length,
      reviewedPhotos: photos.filter((p) => p.isReviewed).length,
      favoritePhotos: photos.filter((p) => p.isFavorite).length,
      selectedPhotos: photos.filter((p) => p.colorTag === "green").length,
      photosToReview: photos.filter((p) => p.colorTag === "yellow").length,
      photosToDiscard: photos.filter((p) => p.colorTag === "red").length,
      averageRating: photos.reduce((sum: number, p: any) => sum + (p.rating || 3), 0) / photos.length,
    }

    // Generar reporte detallado
    const reportData = {
      session,
      stats,
      photos: photos.map((photo) => ({
        id: photo.id,
        rating: photo.rating,
        colorTag: photo.colorTag,
        comments: photo.comments,
        isFavorite: photo.isFavorite,
        isReviewed: photo.isReviewed,
      })),
      generatedAt: new Date().toISOString(),
    }

    // En producción, aquí generarías un PDF con jsPDF o similar
    const reportContent = JSON.stringify(reportData, null, 2)

    return new NextResponse(reportContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="reporte-${session.clientName}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
