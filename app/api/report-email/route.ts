import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export const runtime = "nodejs"

interface Photo {
  id: string
  filename?: string
  rating: number
  isFavorite: boolean
  colorTag: string | null
  comments?: string
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, photos } = await req.json() as { sessionId: string, photos: Photo[] }

    if (!sessionId || !Array.isArray(photos)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Lista de nombres separados por espacios
    const filenames = photos.map(p => p.filename || p.id).join(" ")

    // Tabla HTML
    const rows = photos.map(p => {
      const fav = p.isFavorite ? "Sí" : "No"
      const tag = p.colorTag || "-"
      const comments = (p.comments || "").replace(/\n/g, "<br/>")
      return `<tr><td>${p.filename || p.id}</td><td>${p.rating}</td><td>${tag}</td><td>${fav}</td><td>${comments}</td></tr>`
    }).join("\n")

    const table = `<table border="1" cellpadding="4" cellspacing="0"><thead><tr><th>Nombre</th><th>Rating</th><th>Etiqueta</th><th>Favorita</th><th>Comentarios</th></tr></thead><tbody>${rows}</tbody></table>`

    const htmlBody = `<p>${filenames}</p>${table}`

    // Transporter (usar variables de entorno)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@laimageria.com",
      to: "info@laimageria.com",
      subject: `Selección cliente ${sessionId}`,
      html: htmlBody,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error enviando email:", error)
    return NextResponse.json({ error: "Error enviando correo" }, { status: 500 })
  }
} 