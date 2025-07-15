// Gestor de eventos en tiempo real para sincronización entre clientes
type EventConnection = {
  controller: ReadableStreamDefaultController
  sessionId: string
  clientId: string
}

type EventData = {
  type: 'photo_updated' | 'photo_rating' | 'photo_favorite' | 'photo_comment' | 'photo_color_tag'
  sessionId: string
  photoId?: string
  data?: any
  timestamp: string
}

class EventManager {
  private connections = new Map<string, EventConnection>()

  // Agregar nueva conexión SSE
  addConnection(sessionId: string, controller: ReadableStreamDefaultController): string {
    const clientId = `${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.connections.set(clientId, {
      controller,
      sessionId,
      clientId
    })

    console.log(`[EventManager] Cliente conectado: ${clientId} para sesión ${sessionId}`)
    console.log(`[EventManager] Total conexiones activas: ${this.connections.size}`)
    console.log(`[EventManager] Conexiones para sesión ${sessionId}: ${this.getSessionConnectionCount(sessionId)}`)
    
    return clientId
  }

  // Remover conexión SSE
  removeConnection(clientId: string) {
    const connection = this.connections.get(clientId)
    if (connection) {
      try {
        connection.controller.close()
      } catch (error) {
        console.log(`[EventManager] Error al cerrar controlador para ${clientId}:`, String(error))
      }
      this.connections.delete(clientId)
      console.log(`[EventManager] Cliente desconectado: ${clientId}`)
      console.log(`[EventManager] Total conexiones activas: ${this.connections.size}`)
    } else {
      console.log(`[EventManager] Intento de remover conexión inexistente: ${clientId}`)
    }
  }

  // Enviar evento a todos los clientes de una sesión específica
  broadcastToSession(sessionId: string, event: Omit<EventData, 'sessionId' | 'timestamp'>) {
    const eventData: EventData = {
      ...event,
      sessionId,
      timestamp: new Date().toISOString()
    }

    const message = `data: ${JSON.stringify(eventData)}\n\n`
    let sentCount = 0
    let failedCount = 0

    console.log(`[EventManager] Iniciando broadcast para sesión ${sessionId}`)
    console.log(`[EventManager] Conexiones totales: ${this.connections.size}`)

    // Enviar a todas las conexiones de la sesión
    this.connections.forEach((connection, clientId) => {
      console.log(`[EventManager] Revisando conexión ${clientId} (sesión: ${connection.sessionId})`)
      
      if (connection.sessionId === sessionId) {
        console.log(`[EventManager] Enviando evento a ${clientId}`)
        try {
          connection.controller.enqueue(message)
          sentCount++
          console.log(`[EventManager] Evento enviado exitosamente a ${clientId}`)
        } catch (error) {
          console.error(`[EventManager] Error enviando evento a cliente ${clientId}:`, error)
          // Remover conexión fallida
          this.removeConnection(clientId)
          failedCount++
        }
      }
    })

    console.log(`[EventManager] Evento enviado: ${event.type} para sesión ${sessionId}`)
    console.log(`[EventManager] Enviado a ${sentCount} clientes, ${failedCount} fallos`)
  }

  // Obtener número de conexiones para una sesión
  getSessionConnectionCount(sessionId: string): number {
    let count = 0
    this.connections.forEach(connection => {
      if (connection.sessionId === sessionId) {
        count++
      }
    })
    return count
  }

  // Limpiar conexiones inactivas (método de mantenimiento)
  cleanup() {
    const activeConnections = new Map<string, EventConnection>()
    
    this.connections.forEach((connection, clientId) => {
      try {
        // Intentar enviar un ping para verificar si la conexión está activa
        connection.controller.enqueue(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`)
        activeConnections.set(clientId, connection)
      } catch (error) {
        console.log(`Removiendo conexión inactiva: ${clientId}`)
      }
    })
    
    this.connections = activeConnections
    console.log(`Limpieza completada. Conexiones activas: ${this.connections.size}`)
  }
}

// Instancia singleton del EventManager
export const eventManager = new EventManager()

// Funciones de conveniencia para enviar eventos específicos
export const sendPhotoUpdatedEvent = (sessionId: string, photoId: string, updateType: 'rating' | 'favorite' | 'comment' | 'color_tag', data: any) => {
  eventManager.broadcastToSession(sessionId, {
    type: 'photo_updated',
    photoId,
    data: {
      updateType,
      ...data
    }
  })
}

export const sendPhotoRatingEvent = (sessionId: string, photoId: string, rating: number) => {
  eventManager.broadcastToSession(sessionId, {
    type: 'photo_rating',
    photoId,
    data: { rating }
  })
}

export const sendPhotoFavoriteEvent = (sessionId: string, photoId: string, isFavorite: boolean) => {
  eventManager.broadcastToSession(sessionId, {
    type: 'photo_favorite',
    photoId,
    data: { isFavorite }
  })
}

export const sendPhotoCommentEvent = (sessionId: string, photoId: string, comment: string) => {
  eventManager.broadcastToSession(sessionId, {
    type: 'photo_comment',
    photoId,
    data: { comment }
  })
}

export const sendPhotoColorTagEvent = (sessionId: string, photoId: string, colorTag: string | null) => {
  eventManager.broadcastToSession(sessionId, {
    type: 'photo_color_tag',
    photoId,
    data: { colorTag }
  })
} 