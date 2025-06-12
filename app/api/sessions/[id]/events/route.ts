import type { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params

  // Configurar Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Enviar evento inicial
      const data = JSON.stringify({
        type: "connected",
        sessionId,
        timestamp: new Date().toISOString(),
      })

      controller.enqueue(`data: ${data}\n\n`)

      // Simular eventos periódicos (en producción serían eventos reales)
      const interval = setInterval(() => {
        const eventData = JSON.stringify({
          type: "photo_updated",
          sessionId,
          message: "Una foto ha sido actualizada",
          timestamp: new Date().toISOString(),
        })

        try {
          controller.enqueue(`data: ${eventData}\n\n`)
        } catch (error) {
          clearInterval(interval)
          controller.close()
        }
      }, 30000) // Cada 30 segundos

      // Limpiar cuando se cierre la conexión
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
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
