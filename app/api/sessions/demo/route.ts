import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Datos de demostración
    const sessionData = {
      session: {
        id: "session-001",
        clientName: "María González",
        photographer: "Studio Pro",
        date: "15 de Enero, 2024",
        location: "Sesión Familiar - Parque Central",
        totalPhotos: 48,
        reviewedPhotos: 12,
      },
      photos: Array.from({ length: 48 }, (_, i) => ({
        id: `photo-${i + 1}`,
        url: `/placeholder.svg?height=400&width=300`,
        rating: (i % 5) + 1,
        isFavorite: i % 7 === 0,
        colorTag: i % 4 === 0 ? "green" : i % 4 === 1 ? "yellow" : i % 4 === 2 ? "red" : null,
        comments: i % 6 === 0 ? "Me encanta esta foto, perfecta para imprimir" : "",
        isReviewed: i < 12,
      })),
    }

    return NextResponse.json(sessionData)
  } catch (error) {
    console.error("Error fetching demo session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
