import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { photoId, isFavorite } = await request.json()

    // Validación
    if (!photoId || typeof isFavorite !== "boolean") {
      return NextResponse.json({ error: "Invalid photoId or isFavorite" }, { status: 400 })
    }

    // Actualizar en base de datos local
    await database.updatePhotoReview(photoId, { isFavorite })

    console.log(`Updated favorite status for photo ${photoId}: ${isFavorite}`)

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
