import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sessions, photos, photoReviews } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Obtener todas las sesiones
    const allSessions = await db.select().from(sessions)
    
    // Obtener todas las fotos
    const allPhotos = await db.select().from(photos)
    
    // Obtener todas las reviews
    const allReviews = await db.select().from(photoReviews)
    
    // Obtener fotos con reviews para session-001
    const sessionPhotos = await db
      .select({
        photoId: photos.id,
        filename: photos.filename,
        originalUrl: photos.originalUrl,
        thumbnailUrl: photos.thumbnailUrl,
        uploadOrder: photos.uploadOrder,
        createdAt: photos.createdAt,
        reviewId: photoReviews.id,
        rating: photoReviews.rating,
        colorTag: photoReviews.colorTag,
        comment: photoReviews.comment,
        isFavorite: photoReviews.isFavorite,
        isReviewed: photoReviews.isReviewed,
        reviewUpdatedAt: photoReviews.updatedAt,
      })
      .from(photos)
      .leftJoin(photoReviews, eq(photos.id, photoReviews.photoId))
      .where(eq(photos.sessionId, 'session-001'))
      .orderBy(photos.uploadOrder)

    return NextResponse.json({
      summary: {
        totalSessions: allSessions.length,
        totalPhotos: allPhotos.length,
        totalReviews: allReviews.length,
        session001Photos: sessionPhotos.length
      },
      sessions: allSessions,
      photos: allPhotos,
      reviews: allReviews,
      session001Details: sessionPhotos,
      lastUploadedPhotos: allPhotos
        .filter(photo => photo.sessionId === 'session-001')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10) // Últimas 10 fotos subidas
    })
  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json({ 
      error: 'Database query failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 