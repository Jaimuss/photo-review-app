import type { NextRequest } from "next/server"
import { eventManager } from "@/lib/event-manager"

// Fuerza este handler a ejecutarse en Node.js (no Edge) para que `params` sea síncrono  
export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params

  // Configurar Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Registrar esta conexión en el EventManager
      const clientId = eventManager.addConnection(sessionId, controller)

      // Enviar evento inicial de conexión
      const connectionData = JSON.stringify({
        type: "connected",
        sessionId,
        clientId,
        activeConnections: eventManager.getSessionConnectionCount(sessionId),
        timestamp: new Date().toISOString(),
      })

      controller.enqueue(`data: ${connectionData}\n\n`)

      // Limpiar cuando se cierre la conexión
      request.signal.addEventListener("abort", () => {
        eventManager.removeConnection(clientId)
      })

      // También limpiar si el stream se cierra inesperadamente
      const cleanup = () => {
        eventManager.removeConnection(clientId)
      }

      // Detectar cierre del controlador
      try {
        const originalClose = controller.close.bind(controller)
        controller.close = () => {
          cleanup()
          return originalClose()
        }
      } catch (error) {
        // Si no se puede sobrescribir close, usar el cleanup en abort
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
