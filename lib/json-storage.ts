import fs from 'fs'
import path from 'path'

// Estructura de datos en memoria
interface DataStore {
  sessions: Record<string, any>
  photos: Record<string, any>
  photoReviews: Record<string, any>
  photographers: Record<string, any>
}

class JSONStorage {
  private dataFile: string
  private data: DataStore = {
    sessions: {},
    photos: {},
    photoReviews: {},
    photographers: {}
  }

  constructor() {
    this.dataFile = path.join(process.cwd(), 'data', 'app-data.json')
    this.ensureDataDirectory()
    this.loadData()
  }

  private ensureDataDirectory() {
    const dataDir = path.dirname(this.dataFile)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
  }

  private loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const fileContent = fs.readFileSync(this.dataFile, 'utf8')
        this.data = JSON.parse(fileContent)
      } else {
        this.data = this.getInitialData()
        this.saveData()
      }
    } catch (error) {
      console.error('Error loading data, using initial data:', error)
      this.data = this.getInitialData()
      this.saveData()
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2), 'utf8')
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  private getInitialData(): DataStore {
    const now = Date.now()
    
    // Datos de demo inicial
    const demoPhotos: Record<string, any> = {}
    const demoReviews: Record<string, any> = {}
    
    // Crear 48 fotos de demo
    for (let i = 1; i <= 48; i++) {
      const photoId = `photo-${i}`
      demoPhotos[photoId] = {
        id: photoId,
        sessionId: 'session-001',
        filename: `IMG_${String(i).padStart(4, '0')}.jpg`,
        originalUrl: `/placeholder.svg?height=400&width=300&text=Foto${i}`,
        thumbnailUrl: `/placeholder.svg?height=200&width=150&text=Thumb${i}`,
        uploadOrder: i,
        createdAt: now
      }
      
      demoReviews[`review-${photoId}`] = {
        id: `review-${photoId}`,
        photoId: photoId,
        rating: i % 6, // 0-5 estrellas, base 0
        colorTag: i % 4 === 0 ? 'green' : i % 4 === 1 ? 'yellow' : i % 4 === 2 ? 'red' : null,
        comment: i % 6 === 0 ? 'Me encanta esta foto, perfecta para imprimir' : '',
        isFavorite: i % 7 === 0,
        isReviewed: i < 12,
        updatedAt: now
      }
    }

    return {
      sessions: {
        'session-001': {
          id: 'session-001',
          photographerId: 'demo-photographer',
          clientName: 'María González',
          location: 'Sesión Familiar - Parque Central',
          sessionDate: '2024-01-15',
          accessToken: 'demo-token-123',
          status: 'active',
          createdAt: now
        }
      },
      photos: demoPhotos,
      photoReviews: demoReviews,
      photographers: {
        'demo-photographer': {
          id: 'demo-photographer',
          name: 'Studio Pro',
          email: 'demo@example.com',
          passwordHash: 'dummy-hash',
          studioName: 'Studio Profesional',
          createdAt: now
        }
      }
    }
  }

  // Métodos públicos que replican la API de DatabaseService
  async getSession(sessionId: string) {
    return this.data.sessions[sessionId] || null
  }

  async getSessionByToken(accessToken: string) {
    return Object.values(this.data.sessions).find(
      (session: any) => session.accessToken === accessToken
    ) || null
  }

  async getSessionPhotos(sessionId: string) {
    const photos = Object.values(this.data.photos).filter(
      (photo: any) => photo.sessionId === sessionId
    )
    
    // Unir con reviews
    return photos.map((photo: any) => {
      const review = Object.values(this.data.photoReviews).find(
        (review: any) => review.photoId === photo.id
      ) as any || {}
      
      return {
        id: photo.id,
        sessionId: photo.sessionId,
        filename: photo.filename,
        url: photo.originalUrl,
        uploadOrder: photo.uploadOrder,
        rating: review.rating || 3,
        colorTag: review.colorTag || null,
        comments: review.comment || '',
        isFavorite: review.isFavorite || false,
        isReviewed: review.isReviewed || false,
      }
    }).sort((a, b) => a.uploadOrder - b.uploadOrder)
  }

  async updatePhotoReview(photoId: string, data: any) {
    const reviewId = `review-${photoId}`
    const existingReview = this.data.photoReviews[reviewId] || {}
    
    this.data.photoReviews[reviewId] = {
      ...existingReview,
      id: reviewId,
      photoId,
      ...data,
      updatedAt: Date.now()
    }
    
    this.saveData()
  }

  async getNextUploadOrder(sessionId: string): Promise<number> {
    const photos = Object.values(this.data.photos).filter(
      (photo: any) => photo.sessionId === sessionId
    )
    
    const maxOrder = Math.max(...photos.map((photo: any) => photo.uploadOrder || 0), 0)
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
    this.data.photos[data.id] = {
      ...data,
      createdAt: Date.now()
    }
    
    // Crear review inicial con 0 estrellas
    this.data.photoReviews[`review-${data.id}`] = {
      id: `review-${data.id}`,
      photoId: data.id,
      rating: 0, // Rating base 0 estrellas
      updatedAt: Date.now()
    }
    
    this.saveData()
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
      averageRating: photosData.length > 0 ? photosData.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / photosData.length : 0,
      completionPercentage: photosData.length > 0 ? (photosData.filter((p: any) => p.isReviewed).length / photosData.length) * 100 : 0,
    }
  }

  async updatePhotoUrls(photoId: string, originalUrl: string, thumbnailUrl: string) {
    if (this.data.photos[photoId]) {
      this.data.photos[photoId].originalUrl = originalUrl
      this.data.photos[photoId].thumbnailUrl = thumbnailUrl
      this.saveData()
    }
  }

  // Método para obtener todas las sesiones (para el dashboard)
  async getAllSessions() {
    return Object.values(this.data.sessions)
  }

  // Método para verificar fotógrafo (autenticación dummy)
  async verifyPhotographer(email: string, password: string) {
    // Autenticación dummy - solo para demo
    if (email === 'demo@example.com' && password === 'password') {
      return this.data.photographers['demo-photographer']
    }
    return null
  }

  // Método para crear sesión
  async createSession(data: {
    id: string
    photographerId: string
    clientName: string
    location: string
    sessionDate?: string
    accessToken: string
  }) {
    this.data.sessions[data.id] = {
      ...data,
      status: 'active',
      createdAt: Date.now()
    }
    this.saveData()
  }
}

export const jsonStorage = new JSONStorage() 