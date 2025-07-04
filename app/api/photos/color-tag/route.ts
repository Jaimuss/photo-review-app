import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { photoId, colorTag } = await request.json()

    // Validación
    if (!photoId) {
      return NextResponse.json({ error: "Invalid photoId" }, { status: 400 })
    }

    const validTags = ["green", "yellow", "red", null]
    if (colorTag !== null && !validTags.includes(colorTag)) {
      return NextResponse.json({ error: "Invalid color tag" }, { status: 400 })
    }

    // Actualizar en base de datos local
    await database.updatePhotoReview(photoId, { colorTag, isReviewed: true })

    console.log(`Updated color tag for photo ${photoId}: ${colorTag}`)

    return NextResponse.json({
      success: true,
      photoId,
      colorTag,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating photo color tag:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
