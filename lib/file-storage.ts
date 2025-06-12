// Sistema de almacenamiento de archivos local
import { writeFile, mkdir, unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

class LocalFileStorage {
  private uploadDir = path.join(process.cwd(), "uploads")
  private thumbnailDir = path.join(this.uploadDir, "thumbnails")

  constructor() {
    this.ensureDirectories()
  }

  private async ensureDirectories() {
    try {
      if (!existsSync(this.uploadDir)) {
        await mkdir(this.uploadDir, { recursive: true })
      }
      if (!existsSync(this.thumbnailDir)) {
        await mkdir(this.thumbnailDir, { recursive: true })
      }
    } catch (error) {
      console.error("Error creating upload directories:", error)
    }
  }

  async saveFile(file: File, sessionId: string): Promise<{ url: string; filename: string; size: number }> {
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generar nombre único
      const timestamp = Date.now()
      const extension = path.extname(file.name)
      const filename = `${sessionId}_${timestamp}${extension}`
      const filepath = path.join(this.uploadDir, filename)

      // Guardar archivo
      await writeFile(filepath, buffer)

      return {
        url: `/uploads/${filename}`,
        filename: file.name,
        size: buffer.length,
      }
    } catch (error) {
      console.error("Error saving file:", error)
      throw new Error("Failed to save file")
    }
  }

  async saveMultipleFiles(
    files: File[],
    sessionId: string,
  ): Promise<Array<{ url: string; filename: string; size: number }>> {
    const results = []

    for (const file of files) {
      try {
        const result = await this.saveFile(file, sessionId)
        results.push(result)
      } catch (error) {
        console.error(`Error saving file ${file.name}:`, error)
        // Continuar con los demás archivos
      }
    }

    return results
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filepath = path.join(this.uploadDir, filename)
      await unlink(filepath)
      return true
    } catch (error) {
      console.error("Error deleting file:", error)
      return false
    }
  }

  async generateThumbnail(originalPath: string, thumbnailPath: string): Promise<string> {
    // En producción usarías sharp o similar para generar thumbnails
    // Por ahora retornamos la imagen original
    return originalPath
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`
  }

  getThumbnailUrl(filename: string): string {
    return `/uploads/thumbnails/${filename}`
  }
}

export const fileStorage = new LocalFileStorage()
