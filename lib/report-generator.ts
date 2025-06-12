// Generador de reportes para retocadores
interface ReportData {
  session: {
    id: string
    clientName: string
    photographer: string
    date: string
    location: string
  }
  stats: {
    totalPhotos: number
    reviewedPhotos: number
    favoritePhotos: number
    selectedPhotos: number
    photosToReview: number
    photosToDiscard: number
    averageRating: number
  }
  photos: Array<{
    id: string
    filename: string
    rating: number
    colorTag: string | null
    comments: string
    isFavorite: boolean
    isReviewed: boolean
  }>
}

export class ReportGenerator {
  static generateJSON(data: ReportData): string {
    return JSON.stringify(
      {
        ...data,
        generatedAt: new Date().toISOString(),
        version: "1.0",
      },
      null,
      2,
    )
  }

  static generateCSV(data: ReportData): string {
    const headers = ["ID", "Archivo", "Rating", "Etiqueta", "Comentarios", "Favorita", "Revisada"]

    const rows = data.photos.map((photo) => [
      photo.id,
      photo.filename,
      photo.rating.toString(),
      photo.colorTag || "",
      `"${photo.comments.replace(/"/g, '""')}"`, // Escapar comillas en CSV
      photo.isFavorite ? "Sí" : "No",
      photo.isReviewed ? "Sí" : "No",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    return csvContent
  }

  static generateHTML(data: ReportData): string {
    const { session, stats, photos } = data

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Sesión - ${session.clientName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .tag-green { background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; }
        .tag-yellow { background-color: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; }
        .tag-red { background-color: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 4px; }
        .favorite { color: #e74c3c; }
        .rating { color: #f39c12; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Sesión Fotográfica</h1>
        <h2>${session.location}</h2>
        <p><strong>Cliente:</strong> ${session.clientName}</p>
        <p><strong>Fotógrafo:</strong> ${session.photographer}</p>
        <p><strong>Fecha:</strong> ${session.date}</p>
        <p><strong>Generado:</strong> ${new Date().toLocaleDateString("es-ES")}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${stats.totalPhotos}</div>
            <div class="stat-label">Total de Fotos</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.reviewedPhotos}</div>
            <div class="stat-label">Fotos Revisadas</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.favoritePhotos}</div>
            <div class="stat-label">Favoritas</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.selectedPhotos}</div>
            <div class="stat-label">Seleccionadas</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.photosToReview}</div>
            <div class="stat-label">Para Revisar</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.photosToDiscard}</div>
            <div class="stat-label">Descartar</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.averageRating.toFixed(1)}</div>
            <div class="stat-label">Rating Promedio</div>
        </div>
    </div>

    <h3>Detalle de Fotos</h3>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Archivo</th>
                <th>Rating</th>
                <th>Etiqueta</th>
                <th>Comentarios</th>
                <th>Favorita</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            ${photos
              .map(
                (photo) => `
                <tr>
                    <td>${photo.id}</td>
                    <td>${photo.filename}</td>
                    <td class="rating">${"★".repeat(photo.rating)}${"☆".repeat(5 - photo.rating)}</td>
                    <td>
                        ${
                          photo.colorTag
                            ? `<span class="tag-${photo.colorTag}">${
                                photo.colorTag === "green"
                                  ? "Seleccionar"
                                  : photo.colorTag === "yellow"
                                    ? "Revisar"
                                    : "Descartar"
                              }</span>`
                            : "-"
                        }
                    </td>
                    <td>${photo.comments || "-"}</td>
                    <td>${photo.isFavorite ? '<span class="favorite">❤️</span>' : "-"}</td>
                    <td>${photo.isReviewed ? "✅ Revisada" : "⏳ Pendiente"}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
        <p>Este reporte fue generado automáticamente por el sistema de revisión de fotos.</p>
        <p>Para cualquier consulta, contacta con el fotógrafo responsable.</p>
    </div>
</body>
</html>
    `
  }
}
