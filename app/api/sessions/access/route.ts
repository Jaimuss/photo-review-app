import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Código de acceso requerido" }, { status: 400 })
    }

    // Buscar sesión por token de acceso
    const session = await database.getSessionByToken(code)

    if (!session) {
      return NextResponse.json({ error: "Código de acceso inválido" }, { status: 404 })
    }

    // Verificar si la sesión no ha expirado
    if (session.status !== "active") {
      return NextResponse.json({ error: "La sesión ha expirado" }, { status: 403 })
    }

    return NextResponse.json({
      sessionId: session.id,
      clientName: session.clientName,
      location: session.location,
    })
  } catch (error) {
    console.error("Error verifying access code:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
