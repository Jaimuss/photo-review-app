interface ExportOptions {
  includeExtension: boolean
  changeExtension?: string
  outputFormat: 'column' | 'text' // columna separada o texto separado por espacios
  exportContent: 'full' | 'filenames-only' // contenido completo o solo nombres de archivos
}

interface Photo {
  id: string
  filename?: string
  rating: number
  isFavorite: boolean
  colorTag: string | null
  comments: string
  isReviewed: boolean
}

interface Session {
  id: string
  clientName: string
  photographer: string
  date: string
  location: string
}

export function formatFilename(filename: string, options: ExportOptions): string {
  if (!filename) return ''
  
  let formattedName = filename
  
  // Cambiar extensión si se especifica
  if (options.changeExtension) {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    formattedName = `${nameWithoutExt}.${options.changeExtension}`
  }
  
  // Quitar extensión si no se quiere incluir
  if (!options.includeExtension && !options.changeExtension) {
    formattedName = filename.replace(/\.[^/.]+$/, '')
  }
  
  return formattedName
}

export function generateExcelData(
  session: Session,
  photos: Photo[],
  options: ExportOptions
) {
  const data = []

  // Si solo se quieren los nombres de archivos, retornar solo eso
  if (options.exportContent === 'filenames-only') {
    if (options.outputFormat === 'column') {
      // Una columna con todos los nombres
      photos.forEach(photo => {
        data.push([formatFilename(photo.filename || photo.id, options)])
      })
    } else {
      // Una sola línea con todos los nombres separados por espacios
      const filenames = photos.map(photo => 
        formatFilename(photo.filename || photo.id, options)
      ).join(' ')
      data.push([filenames])
    }
    return data
  }

  // Contenido completo (lógica original)
  const selectedPhotos = photos.filter(p => p.colorTag === 'green')
  const favoritePhotos = photos.filter(p => p.isFavorite)
  const reviewPhotos = photos.filter(p => p.colorTag === 'yellow')
  const discardPhotos = photos.filter(p => p.colorTag === 'red')
  
  // Información de la sesión
  data.push(['REPORTE DE SESIÓN FOTOGRÁFICA'])
  data.push([])
  data.push(['Cliente:', session.clientName])
  data.push(['Fotógrafo:', session.photographer])
  data.push(['Fecha:', session.date])
  data.push(['Ubicación:', session.location])
  data.push([])
  
  // Estadísticas
  data.push(['ESTADÍSTICAS'])
  data.push(['Total de fotos:', photos.length])
  data.push(['Fotos revisadas:', photos.filter(p => p.isReviewed).length])
  data.push(['Fotos favoritas:', favoritePhotos.length])
  data.push(['Para seleccionar:', selectedPhotos.length])
  data.push(['Para revisar:', reviewPhotos.length])
  data.push(['Para descartar:', discardPhotos.length])
  data.push(['Rating promedio:', (photos.reduce((sum, p) => sum + p.rating, 0) / photos.length).toFixed(1)])
  data.push([])
  
  // Fotos seleccionadas
  if (selectedPhotos.length > 0) {
    data.push(['FOTOS SELECCIONADAS (Verde)'])
    if (options.outputFormat === 'column') {
      data.push(['Archivo', 'Rating', 'Favorita', 'Comentarios'])
      selectedPhotos.forEach(photo => {
        data.push([
          formatFilename(photo.filename || photo.id, options),
          photo.rating,
          photo.isFavorite ? 'Sí' : 'No',
          photo.comments || ''
        ])
      })
    } else {
      const filenames = selectedPhotos.map(photo => 
        formatFilename(photo.filename || photo.id, options)
      ).join(' ')
      data.push([filenames])
    }
    data.push([])
  }
  
  // Fotos favoritas
  if (favoritePhotos.length > 0) {
    data.push(['FOTOS FAVORITAS'])
    if (options.outputFormat === 'column') {
      data.push(['Archivo', 'Rating', 'Etiqueta', 'Comentarios'])
      favoritePhotos.forEach(photo => {
        data.push([
          formatFilename(photo.filename || photo.id, options),
          photo.rating,
          photo.colorTag || 'Sin etiqueta',
          photo.comments || ''
        ])
      })
    } else {
      const filenames = favoritePhotos.map(photo => 
        formatFilename(photo.filename || photo.id, options)
      ).join(' ')
      data.push([filenames])
    }
    data.push([])
  }
  
  // Fotos para revisar
  if (reviewPhotos.length > 0) {
    data.push(['FOTOS PARA REVISAR (Amarillo)'])
    if (options.outputFormat === 'column') {
      data.push(['Archivo', 'Rating', 'Favorita', 'Comentarios'])
      reviewPhotos.forEach(photo => {
        data.push([
          formatFilename(photo.filename || photo.id, options),
          photo.rating,
          photo.isFavorite ? 'Sí' : 'No',
          photo.comments || ''
        ])
      })
    } else {
      const filenames = reviewPhotos.map(photo => 
        formatFilename(photo.filename || photo.id, options)
      ).join(' ')
      data.push([filenames])
    }
    data.push([])
  }
  
  // Fotos para descartar
  if (discardPhotos.length > 0) {
    data.push(['FOTOS PARA DESCARTAR (Rojo)'])
    if (options.outputFormat === 'column') {
      data.push(['Archivo', 'Rating', 'Favorita', 'Comentarios'])
      discardPhotos.forEach(photo => {
        data.push([
          formatFilename(photo.filename || photo.id, options),
          photo.rating,
          photo.isFavorite ? 'Sí' : 'No',
          photo.comments || ''
        ])
      })
    } else {
      const filenames = discardPhotos.map(photo => 
        formatFilename(photo.filename || photo.id, options)
      ).join(' ')
      data.push([filenames])
    }
    data.push([])
  }
  
  // Todas las fotos (opcional)
  data.push(['TODAS LAS FOTOS'])
  data.push(['Archivo', 'Rating', 'Favorita', 'Etiqueta', 'Comentarios'])
  photos.forEach(photo => {
    data.push([
      formatFilename(photo.filename || photo.id, options),
      photo.rating,
      photo.isFavorite ? 'Sí' : 'No',
      photo.colorTag || 'Sin etiqueta',
      photo.comments || ''
    ])
  })
  
  return data
}

export function downloadExcel(data: any[][], filename: string) {
  // Crear CSV (compatible con Excel)
  const csvContent = data.map(row => 
    row.map(cell => {
      // Escapar comillas y añadir comillas si contiene comas, saltos de línea o comillas
      const cellStr = String(cell || '')
      if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(',')
  ).join('\n')
  
  // Crear y descargar archivo
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
} 