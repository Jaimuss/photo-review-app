import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'
import { database } from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Verificar que la sesión existe
    const session = await database.getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Crear directorios si no existen
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', sessionId)
    const thumbDir = path.join(uploadDir, 'thumbnails')
    
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
    if (!existsSync(thumbDir)) await mkdir(thumbDir, { recursive: true })

    const results = []
    const timestamp = Date.now()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        continue // Skip non-image files
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generar nombres únicos
      const extension = path.extname(file.name).toLowerCase()
      const baseName = path.basename(file.name, extension)
      const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_')
      const filename = `${timestamp}_${i}_${safeBaseName}${extension}`
      
      const originalPath = path.join(uploadDir, filename)
      const thumbnailPath = path.join(thumbDir, filename)

      try {
        // Guardar imagen original (optimizada)
        await sharp(buffer)
          .resize(2048, 2048, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 90 })
          .toFile(originalPath)

        // Generar thumbnail
        await sharp(buffer)
          .resize(400, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath)

        // Guardar en base de datos
        const photoId = `photo-${sessionId}-${timestamp}-${i}`
        await database.createPhoto({
          id: photoId,
          sessionId,
          filename: file.name,
          originalUrl: `/uploads/${sessionId}/${filename}`,
          thumbnailUrl: `/uploads/${sessionId}/thumbnails/${filename}`,
          uploadOrder: await database.getNextUploadOrder(sessionId)
        })

        results.push({
          id: photoId,
          filename: file.name,
          originalUrl: `/uploads/${sessionId}/${filename}`,
          thumbnailUrl: `/uploads/${sessionId}/thumbnails/${filename}`,
          size: file.size,
          type: file.type
        })

      } catch (imageError) {
        console.error(`Error processing image ${file.name}:`, imageError)
        // Continue with next file
      }
    }

    return NextResponse.json({ 
      success: true, 
      uploaded: results.length,
      files: results,
      sessionId
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 