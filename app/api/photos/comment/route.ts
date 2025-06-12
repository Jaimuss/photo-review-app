import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { photoId, comment } = await request.json()

    // Validación
    if (!photoId) {
      return NextResponse.json({ error: "Invalid photoId" }, { status: 400 })
    }

    // Actualizar en base de datos local
    await database.updatePhotoReview(photoId, { comment, isReviewed: true })

    console.log(`Updated comment for photo ${photoId}: ${comment}`)

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
