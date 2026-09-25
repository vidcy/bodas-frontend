import React, { useState, useEffect } from 'react'
import defaultCoupleImg from '../assets/couple.jpg'

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
 * 3. Si ambos fallan, conmuta a una imagen local de alta calidad (fallbackSrc o pareja).
 * 4. NUNCA deja el recuadro roto con solo el alt.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc = defaultCoupleImg,
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
