import { db } from './db'
import { sessions, photos, photoReviews } from './db/schema'
import { eq, and } from 'drizzle-orm'

// Forzar inicialización de la base de datos
import './db'

export class DatabaseService {
  async getSession(sessionId: string) {
    const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1)
    return result[0] || null
  }

  async getSessionByToken(accessToken: string) {
    const result = await db.select().from(sessions).where(eq(sessions.accessToken, accessToken)).limit(1)
    return result[0] || null
  }

  async getSessionPhotos(sessionId: string) {
    const result = await db
      .select({
        id: photos.id,
        sessionId: photos.sessionId,
        filename: photos.filename,
        url: photos.originalUrl,
        uploadOrder: photos.uploadOrder,
        rating: photoReviews.rating,
        colorTag: photoReviews.colorTag,
        comments: photoReviews.comment,
        isFavorite: photoReviews.isFavorite,
        isReviewed: photoReviews.isReviewed,
      })
      .from(photos)
      .leftJoin(photoReviews, eq(photos.id, photoReviews.photoId))
      .where(eq(photos.sessionId, sessionId))
      .orderBy(photos.uploadOrder)

    return result
  }

  async updatePhotoReview(photoId: string, data: any) {
    const existing = await db.select().from(photoReviews).where(eq(photoReviews.photoId, photoId)).limit(1)
    
    if (existing.length > 0) {
      await db.update(photoReviews)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(photoReviews.photoId, photoId))
    } else {
      await db.insert(photoReviews).values({
        id: `review-${photoId}`,
        photoId,
        ...data,
        updatedAt: new Date()
      })
    }
  }

  async getNextUploadOrder(sessionId: string): Promise<number> {
    const result = await db
      .select({ maxOrder: photos.uploadOrder })
      .from(photos)
      .where(eq(photos.sessionId, sessionId))
      .orderBy(photos.uploadOrder)

    const maxOrder = result.reduce((max, photo) => 
      Math.max(max, photo.maxOrder || 0), 0
    )
    
    return maxOrder + 1
  }

  async createPhoto(data: {
    id: string
    sessionId: string
    filename: string
    originalUrl: string
    thumbnailUrl?: string
    uploadOrder: number
  }) {
    await db.insert(photos).values({
      ...data,
      createdAt: new Date()
    })
    
    // Crear review inicial
    await db.insert(photoReviews).values({
      id: `review-${data.id}`,
      photoId: data.id,
      rating: 3,
      updatedAt: new Date()
    })
  }

  async getSessionStats(sessionId: string) {
    const photosData = await this.getSessionPhotos(sessionId)

    return {
      totalPhotos: photosData.length,
      reviewedPhotos: photosData.filter((p: any) => p.isReviewed).length,
      favoritePhotos: photosData.filter((p: any) => p.isFavorite).length,
      selectedPhotos: photosData.filter((p: any) => p.colorTag === "green").length,
      photosToReview: photosData.filter((p: any) => p.colorTag === "yellow").length,
      photosToDiscard: photosData.filter((p: any) => p.colorTag === "red").length,
      averageRating: photosData.length > 0 ? photosData.reduce((sum: number, p: any) => sum + (p.rating || 3), 0) / photosData.length : 0,
      completionPercentage: photosData.length > 0 ? (photosData.filter((p: any) => p.isReviewed).length / photosData.length) * 100 : 0,
    }
  }

}

export const database = new DatabaseService()
