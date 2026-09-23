import { useState, useRef, useEffect } from 'react'
import type { VideoItem } from '../types/wedding'

interface VideoCinemaProps {
  videos: VideoItem[]
  defaultVideoId?: string
  defaultTitle?: string
  onVideoPlay?: () => void
  onVideoPause?: () => void
}

function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedUrl: string; videoId?: string } {
  if (!url) return { type: 'youtube', embedUrl: 'https://www.youtube.com/embed/2Vv-BfVoq4g?enablejsapi=1&rel=0', videoId: '2Vv-BfVoq4g' }

  // YouTube match (watch?v=, embed/, youtu.be/, shorts/)
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|video\/))([\w-]{11})/)
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&rel=0&autoplay=1`,
      videoId: ytMatch[1]
    }
  }

  // If raw 11-char ID
  if (/^[\w-]{11}$/.test(url.trim())) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${url.trim()}?enablejsapi=1&rel=0&autoplay=1`,
      videoId: url.trim()
    }
  }

  // Vimeo match
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/)
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1` }
  }

  return { type: 'direct', embedUrl: url }
}

export function VideoCinema({
  videos,
  defaultVideoId,
  defaultTitle,
  onVideoPlay,
  onVideoPause,
}: VideoCinemaProps) {
  const fallbackVideos: VideoItem[] = [
    {
      id: 'v-promo-default',
      title: '✨ Tráiler Oficial: Anuncio & Publicidad de la Boda',
      url: defaultVideoId ? `https://www.youtube.com/watch?v=${defaultVideoId}` : 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
      platform: 'youtube',
      category: 'Publicidad & Anuncio Oficial'
    },
    {
      id: 'v-love-default',
      title: defaultTitle || '💕 Nuestra Hermosa Historia de Amor (Luis & Victoria)',
      url: 'https://www.youtube.com/watch?v=rtOvBOTyX00',
      platform: 'youtube',
      category: 'Historia de Amor & Documental'
    }
  ]

  const allVideos: VideoItem[] = videos && videos.length > 0 ? videos : fallbackVideos

  const [activeVideo, setActiveVideo] = useState<VideoItem>(allVideos[0])
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isLockedPlay, setIsLockedPlay] = useState<boolean>(false) // Si el usuario dio Play explícito
  const [copied, setCopied] = useState<boolean>(false)

  const sectionRef = useRef<HTMLElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const videoElemRef = useRef<HTMLVideoElement>(null)

  const parsed = parseVideoUrl(activeVideo.url)

  // Enviar comando a YouTube iframe
  const sendIframeCommand = (cmd: 'playVideo' | 'pauseVideo' | 'mute' | 'unMute') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: cmd, args: '' }),
        '*'
      )
    }
  }

  // 1. CURSOR ENTRA AL VIDEO (onMouseEnter)
  // La música de la página para e inicia el video
  const handleMouseEnter = () => {
    if (!isLockedPlay) {
      setIsPlaying(true)
      onVideoPlay?.() // Silencia y pausa la música de fondo
      sendIframeCommand('playVideo')
      if (videoElemRef.current) {
        videoElemRef.current.play().catch(() => {})
      }
    }
  }

  // 2. CURSOR SALE DEL VIDEO (onMouseLeave)
  // Si quita el cursor del video, vuelve la música (a no ser que le haya dado Play explícito)
  const handleMouseLeave = () => {
    if (!isLockedPlay) {
      // No está fijado por click: se detiene el video y vuelve la música de fondo
      setIsPlaying(false)
      sendIframeCommand('pauseVideo')
      if (videoElemRef.current) {
        videoElemRef.current.pause()
      }
      onVideoPause?.() // Reanuda la música de fondo
    }
  }

  // 3. CLICK EXPLÍCITO EN PLAY ("a no ser le de play en el video")
  // Hasta que no le dé pausa o cierre la ventana, la música NO vuelve y el video continúa
  const handleLockPlay = () => {
    setIsLockedPlay(true)
    setIsPlaying(true)
    onVideoPlay?.()
    sendIframeCommand('playVideo')
    if (videoElemRef.current) {
      videoElemRef.current.play().catch(() => {})
    }
  }

  // 4. PAUSA EXPLÍCITA O CERRAR VENTANA
  // Se detiene el video y recién continúa la música
  const handlePauseOrStop = () => {
    setIsLockedPlay(false)
    setIsPlaying(false)
    sendIframeCommand('pauseVideo')
    if (videoElemRef.current) {
      videoElemRef.current.pause()
    }
    onVideoPause?.()
  }

  // Escuchar mensajes de estado de YouTube
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data && data.event === 'onStateChange') {
          if (data.info === 1) {
            // Video empezó a reproducirse
            setIsPlaying(true)
            onVideoPlay?.()
          } else if (data.info === 2 || data.info === 0) {
            // Video en pausa o finalizado
            if (!isLockedPlay) {
              setIsPlaying(false)
              onVideoPause?.()
            }
          }
        }
      } catch {}
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isLockedPlay, onVideoPlay, onVideoPause])

  // Pausar video automáticamente si se scrollea lejos y no está en modo fijado
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && isPlaying && !isLockedPlay) {
            handlePauseOrStop()
          }
        })
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    return () => observer.disconnect()
  }, [isPlaying, isLockedPlay])

  const handleShare = () => {
    navigator.clipboard?.writeText(activeVideo.url || window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section
      ref={sectionRef}
      id="videos"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#14071b] via-[#220d2d] to-[#120718] text-white overflow-hidden relative"
    >
      {/* LUCES AMBIENTALES */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] bg-rose-600/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-purple-600/15 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* CABECERA */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-[0.25em] mb-4 shadow-lg">
            <span>🎬</span>
            <span>Sala de Cine Nupcial &bull; Control Inteligente de Audio</span>
            <span>✨</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-rose-300">
            Nuestros Videos Exclusivos
          </h2>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto mt-3 leading-relaxed">
            Pasa el cursor sobre el video para previsualizarlo con sonido original y pausar la música de fondo. Dale clic en &ldquo;Reproducir&rdquo; para dejarlo activo en pantalla.
          </p>
        </div>

        {/* SELECTOR DE VIDEOS (1: PUBLICIDAD/ANUNCIO, 2: HISTORIA DE AMOR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
          {allVideos.slice(0, 2).map((vid, idx) => {
            const isSelected = activeVideo.id === vid.id || (activeVideo.url === vid.url && !activeVideo.id)
            const isFirst = idx === 0
            return (
              <button
                key={vid.id || idx}
                type="button"
                onClick={() => {
                  handlePauseOrStop()
                  setActiveVideo(vid)
                }}
                className={`relative p-5 rounded-3xl text-left transition-all duration-300 cursor-pointer overflow-hidden border ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-400/25 via-pink-500/25 to-purple-600/30 border-amber-400 shadow-xl shadow-amber-500/15 scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 font-bold shadow-lg transition-transform ${
                      isSelected
                        ? 'bg-gradient-to-tr from-amber-400 to-rose-500 text-white scale-110'
                        : 'bg-white/10 text-amber-300'
                    }`}
                  >
                    {isFirst ? '📢' : '💖'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.65rem] font-extrabold tracking-widest uppercase text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                        {isFirst ? 'Video 1: Publicidad & Anuncio' : 'Video 2: Historia de Amor'}
                      </span>
                      {isSelected && (
                        <span className="text-[0.62rem] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          ● En Pantalla
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-white truncate">
                      {vid.title}
                    </h3>
                    <p className="text-xs text-stone-400 truncate mt-0.5">
                      {vid.category || (isFirst ? 'Anuncio Oficial' : 'Historia de Amor & Documental')}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* PANTALLA PRINCIPAL DE CINE (DETECTA HOVER Y CLICK) */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative rounded-3xl overflow-hidden shadow-2xl border transition-all duration-500 bg-black/95 backdrop-blur-2xl mb-8 group ${
            isLockedPlay
              ? 'border-amber-400 ring-4 ring-amber-400/30 shadow-[0_0_60px_rgba(251,191,36,0.35)]'
              : isPlaying
              ? 'border-pink-400/80 shadow-[0_0_40px_rgba(244,114,182,0.3)]'
              : 'border-white/20'
          }`}
        >
          {/* LUZ RADIAL */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/30 via-amber-400/20 to-purple-600/30 blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* CONTENEDOR DEL VIDEO CON PROPORCIÓN 16:9 */}
          <div className="relative w-full z-10" style={{ paddingBottom: '56.25%', height: 0 }}>
            {isPlaying || isLockedPlay ? (
              parsed.type === 'direct' ? (
                <video
                  ref={videoElemRef}
                  controls
                  autoPlay
                  onPause={() => {
                    if (!isLockedPlay) handlePauseOrStop()
                  }}
                  onEnded={handlePauseOrStop}
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                  src={parsed.embedUrl}
                />
              ) : (
                <iframe
                  ref={iframeRef}
                  className="absolute inset-0 w-full h-full border-none"
                  src={parsed.embedUrl}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )
            ) : (
              /* PORTADA DE CINE CON BOTÓN DE PLAY */
              <div
                onClick={handleLockPlay}
                className="absolute inset-0 flex flex-col items-center justify-center bg-radial from-purple-950/80 via-black/90 to-black cursor-pointer group"
                style={{
                  backgroundImage: parsed.videoId
                    ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url(https://img.youtube.com/vi/${parsed.videoId}/maxresdefault.jpg)`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* BOTÓN DE REPRODUCCIÓN */}
                <div className="relative flex items-center justify-center mb-4">
                  <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 opacity-60 blur-xl group-hover:opacity-90 group-hover:scale-125 transition-all duration-500" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 border-2 border-white/80 shadow-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform duration-300">
                    ▶
                  </div>
                </div>

                <div className="text-center px-4 max-w-md">
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-amber-300 bg-black/60 px-3 py-1 rounded-full border border-amber-300/40 backdrop-blur-md">
                    Haz Clic para Reproducir &bull; O sitúa el cursor encima
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-2 drop-shadow-md">
                    {activeVideo.title}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1">
                    (La música de fondo se pausará automáticamente para no mezclarse)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* BARRA INFERIOR DE CONTROLES DEL REPRODUCTOR */}
          <div className="relative z-10 p-4 sm:p-6 bg-gradient-to-r from-stone-950 via-[#1c0c24] to-stone-950 flex items-center justify-between flex-wrap gap-4 border-t border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[0.68rem] font-bold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                  {activeVideo.category || 'En Pantalla'}
                </span>
                <span className="text-[0.65rem] text-stone-400 font-medium">
                  {isLockedPlay
                    ? '🔒 Modo Cine Fijo Activo'
                    : isPlaying
                    ? '👁️ Previsualizando al situar cursor'
                    : '🎵 Música de Fondo Activa'}
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-2xl font-bold text-white">
                {activeVideo.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* BOTÓN REPRODUCIR / FIJAR */}
              {!isLockedPlay ? (
                <button
                  type="button"
                  onClick={handleLockPlay}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 hover:brightness-110 text-white text-xs font-bold shadow-xl shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
                >
                  <span>▶️</span>
                  <span>Fijar Reproducción</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseOrStop}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/60 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-lg"
                >
                  <span>⏸️</span>
                  <span>Pausar Video &amp; Volver a la Música</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-stone-200 transition-all cursor-pointer active:scale-95"
              >
                <span>{copied ? '✅' : '🔗'}</span>
                <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
              </button>

              <a
                href={activeVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition-all"
              >
                <span>Ver en YouTube</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
