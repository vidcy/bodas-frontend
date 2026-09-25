import React, { useState, useEffect } from 'react'

export const ELEGANT_WEDDING_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231f0a2a'/%3E%3Cstop offset='50%25' stop-color='%233a124a'/%3E%3Cstop offset='100%25' stop-color='%2315051e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Ccircle cx='400' cy='300' r='180' fill='none' stroke='%23f59e0b' stroke-width='2' stroke-opacity='0.4' stroke-dasharray='8 6'/%3E%3Ctext x='50%25' y='46%25' text-anchor='middle' font-size='56'%3E💍%3C/text%3E%3Ctext x='50%25' y='56%25' text-anchor='middle' font-family='serif' font-size='22' font-weight='bold' fill='%23fbbf24' letter-spacing='3'%3ENUESTRA BODA%3C/text%3E%3Ctext x='50%25' y='63%25' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%23e9d5ff' letter-spacing='2'%3ELUIS %26 VICTORIA%3C/text%3E%3C/svg%3E"

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  fallbackSrc?: string
  alt?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Componente SafeImage para carga de imágenes en DigitalOcean Spaces y CDN:
 * 1. Intenta cargar la URL original (usualmente la CDN https://<bucket>.<region>.cdn.digitaloceanspaces.com).
 * 2. Si falla (error 403, 404, bloqueo de CDN o red), conmuta automáticamente al endpoint directo
 *    de DigitalOcean Spaces (https://<bucket>.<region>.digitaloceanspaces.com).
 * 3. Si ambos fallan, conmuta al placeholder SVG dorado ultra ligero.
 * 4. NUNCA deja el recuadro roto con solo el alt.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc = ELEGANT_WEDDING_PLACEHOLDER,
  alt = 'Fotografía',
  className = '',
  style,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc)
  const [hasTriedDirect, setHasTriedDirect] = useState<boolean>(false)
  const [hasTriedFallback, setHasTriedFallback] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (src) {
      setCurrentSrc(src)
      setHasTriedDirect(false)
      setHasTriedFallback(false)
      setIsLoaded(false)
    } else {
      setCurrentSrc(fallbackSrc)
      setIsLoaded(true)
    }
  }, [src, fallbackSrc])

  const handleError = () => {
    // 1. Si era una URL CDN de DigitalOcean Spaces, intentar el endpoint de origen directo
    if (!hasTriedDirect && currentSrc.includes('.cdn.digitaloceanspaces.com')) {
      const directUrl = currentSrc.replace('.cdn.digitaloceanspaces.com', '.digitaloceanspaces.com')
      setHasTriedDirect(true)
      setCurrentSrc(directUrl)
      return
    }

    // 2. Si falló la directa o cualquier otra URL, usar la imagen local segura
    if (!hasTriedFallback && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasTriedFallback(true)
      setCurrentSrc(fallbackSrc)
      return
    }
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-90'}`}
      style={style}
      onError={handleError}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  )
}
export default SafeImage
