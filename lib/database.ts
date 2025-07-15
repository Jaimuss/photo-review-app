// Usando JSON Storage temporal en lugar de SQLite hasta resolver el problema de compilación
import { jsonStorage } from './json-storage'

export class DatabaseService {
  async getSession(sessionId: string) {
    return jsonStorage.getSession(sessionId)
  }

  async getSessionByToken(accessToken: string) {
    return jsonStorage.getSessionByToken(accessToken)
  }

  async getSessionPhotos(sessionId: string) {
    return jsonStorage.getSessionPhotos(sessionId)
  }

  async updatePhotoReview(photoId: string, data: any) {
    return jsonStorage.updatePhotoReview(photoId, data)
  }

  async getNextUploadOrder(sessionId: string): Promise<number> {
    return jsonStorage.getNextUploadOrder(sessionId)
  }

  async createPhoto(data: {
    id: string
    sessionId: string
    filename: string
    originalUrl: string
    thumbnailUrl?: string
    uploadOrder: number
  }) {
    return jsonStorage.createPhoto(data)
  }

  async getSessionStats(sessionId: string) {
    return jsonStorage.getSessionStats(sessionId)
  }

  async updatePhotoUrls(photoId: string, originalUrl: string, thumbnailUrl: string) {
    return jsonStorage.updatePhotoUrls(photoId, originalUrl, thumbnailUrl)
  }

  // Métodos adicionales para el MVP
  async getAllSessions() {
    return jsonStorage.getAllSessions()
  }

  async verifyPhotographer(email: string, password: string) {
    return jsonStorage.verifyPhotographer(email, password)
  }

  async createSession(data: {
    id: string
    photographerId: string
    clientName: string
    location: string
    sessionDate?: string
    accessToken: string
  }) {
    return jsonStorage.createSession(data)
  }

  // Método para obtener sessionId a partir de photoId
  async getSessionIdByPhotoId(photoId: string): Promise<string | null> {
    return jsonStorage.getSessionIdByPhotoId(photoId)
  }

}

export const database = new DatabaseService()
