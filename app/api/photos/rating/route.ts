import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { photoId, rating } = await request.json()

    // Validación
    if (!photoId || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid photoId or rating" }, { status: 400 })
    }

    // Actualizar en base de datos local
    await database.updatePhotoReview(photoId, { rating, isReviewed: true })

    console.log(`Updated rating for photo ${photoId}: ${rating} stars`)

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
