/**
 * Utilidad de optimización y compresión inteligente de imágenes en el cliente.
 * Convierte fotos pesadas (3MB - 15MB) a formato WebP optimizado (~100KB - 250KB),
 * preservando la máxima fidelidad visual y eliminando los desbordamientos de memoria.
 */

export interface OptimizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0.1 a 1.0 (default: 0.82)
  format?: 'image/webp' | 'image/jpeg'
}

export async function optimizeImage(
  file: File | Blob,
  options: OptimizeOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    format = 'image/webp'
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'))

    reader.onload = (e) => {
      const img = new Image()

      img.onerror = () => reject(new Error('Error al decodificar la imagen'))

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calcular escalado proporcional manteniendo la relación de aspecto
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          // Si no se puede obtener el contexto 2d, retornar el original
          resolve(e.target?.result as string)
          return
        }

        // Suavizado de imagen de alta calidad
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        try {
          // Intentar exportar a WebP
          const dataUrl = canvas.toDataURL(format, quality)
          resolve(dataUrl)
        } catch {
          // Fallback a JPEG si el navegador no soporta exportar WebP en canvas
          try {
            const fallbackUrl = canvas.toDataURL('image/jpeg', quality)
            resolve(fallbackUrl)
          } catch {
            resolve(e.target?.result as string)
          }
        }
      }

      img.src = e.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Calcula el tamaño aproximado en kilobytes de una cadena Base64
 */
export function getBase64SizeKb(base64String: string): number {
  if (!base64String) return 0
  const stringLength = base64String.length - (base64String.indexOf(',') + 1)
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383612
  return Math.round(sizeInBytes / 1024)
}
