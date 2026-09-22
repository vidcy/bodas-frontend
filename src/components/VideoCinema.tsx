import { useState } from 'react'
import type { VideoItem } from '../types/wedding'

interface VideoCinemaProps {
  videos: VideoItem[]
  defaultVideoId?: string
  defaultTitle?: string
}

function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedUrl: string } {
  if (!url) return { type: 'youtube', embedUrl: 'https://www.youtube.com/embed/2Vv-BfVoq4g' }

  // YouTube match (watch?v=, embed/, youtu.be/, shorts/)
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/)
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` }
  }

  // If raw 11-char ID
  if (/^[\w-]{11}$/.test(url.trim())) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${url.trim()}?autoplay=1&rel=0` }
  }

  // Vimeo match
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/)
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1` }
  }

  return { type: 'direct', embedUrl: url }
}

export function VideoCinema({ videos, defaultVideoId, defaultTitle }: VideoCinemaProps) {
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
  const [copied, setCopied] = useState(false)
  const parsed = parseVideoUrl(activeVideo.url)

  const handleShare = () => {
    navigator.clipboard?.writeText(activeVideo.url || window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section id="videos" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#150a1c] via-[#220d2d] to-[#120718] text-white overflow-hidden relative">
      {/* GLOWING AMBIENT LIGHTS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-pink-500/20 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-purple-600/20 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HEADER CON ESTILO CINEMATOGRÁFICO */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-[0.25em] mb-4 shadow-lg">
            <span>🎬</span>
            <span>Sala de Cine Nupcial · Experiencia 4K</span>
            <span>✨</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-rose-300">
            Nuestros Videos Exclusivos
          </h2>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto mt-3 leading-relaxed">
            Te invitamos a ponerte cómodo y revivir la emoción de nuestro camino al altar a través de nuestras producciones oficiales
          </p>
        </div>

        {/* SELECTOR DE LOS 2 VIDEOS PRINCIPALES (PUBLICIDAD vs HISTORIA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
          {allVideos.slice(0, 2).map((vid, idx) => {
            const isSelected = activeVideo.id === vid.id || (activeVideo.url === vid.url && !activeVideo.id)
            const isFirst = idx === 0
            return (
              <button
                key={vid.id || idx}
                type="button"
                onClick={() => setActiveVideo(vid)}
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
                        {isFirst ? 'Video 1: Publicidad' : 'Video 2: Historia'}
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
                      {vid.category || (isFirst ? 'Anuncio & Tráiler Nupcial' : 'Momentos Románticos')}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* MAIN CINEMA SCREEN */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black/80 backdrop-blur-2xl mb-8 group">
          {/* LUZ AMBIENTAL DE DETRÁS DE LA PANTALLA */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/30 via-amber-400/20 to-purple-600/30 blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* CONTENEDOR DEL VIDEO */}
          <div className="relative w-full z-10" style={{ paddingBottom: '56.25%', height: 0 }}>
            {parsed.type === 'direct' ? (
              <video
                controls
                autoPlay
                className="absolute inset-0 w-full h-full object-cover bg-black"
                src={parsed.embedUrl}
              />
            ) : (
              <iframe
                className="absolute inset-0 w-full h-full border-none"
                src={parsed.embedUrl}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>

          {/* BARRA INFERIOR DEL REPRODUCTOR CON CONTROLES & DETALLES */}
          <div className="relative z-10 p-4 sm:p-6 bg-gradient-to-r from-stone-950 via-[#1c0c24] to-stone-950 flex items-center justify-between flex-wrap gap-4 border-t border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[0.68rem] font-bold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                  {activeVideo.category || 'En Reproducción'}
                </span>
                <span className="text-[0.65rem] text-stone-400 font-medium">
                  Resolución Cinemática 1080p Full HD
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-2xl font-bold text-white">
                {activeVideo.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-stone-200 transition-all cursor-pointer active:scale-95"
              >
                <span>{copied ? '✅' : '🔗'}</span>
                <span>{copied ? '¡Enlace Copiado!' : 'Compartir Video'}</span>
              </button>

              <a
                href={activeVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all"
              >
                <span>Ver en YouTube</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* VIDEOS ADICIONALES (SI HAY MÁS DE 2 EN EL SISTEMA) */}
        {allVideos.length > 2 && (
          <div className="mt-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300/80 mb-4 flex items-center gap-2">
              <span>🎞️</span>
              <span>Más Momentos en Video ({allVideos.length - 2})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allVideos.slice(2).map((vid, idx) => (
                <button
                  key={vid.id || idx}
                  onClick={() => setActiveVideo(vid)}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    activeVideo.id === vid.id
                      ? 'bg-white/20 border-2 border-amber-400 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-lg flex-shrink-0 shadow-md">
                    ▶
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[0.62rem] text-amber-300 uppercase tracking-wider font-bold">
                      {vid.category || 'Video Extra'}
                    </span>
                    <p className="text-sm font-semibold text-white truncate">
                      {vid.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
