import { useState } from 'react'
import type { VideoItem } from '../types/wedding'

interface VideoCinemaProps {
  videos: VideoItem[]
  defaultVideoId?: string
  defaultTitle?: string
}

function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedUrl: string } {
  if (!url) return { type: 'youtube', embedUrl: 'https://www.youtube.com/embed/2Vv-BfVoq4g' }

  // YouTube match
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` }
  }

  // If raw 11-char ID
  if (/^[\w-]{11}$/.test(url)) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${url}?autoplay=1&rel=0` }
  }

  // Vimeo match
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/)
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1` }
  }

  return { type: 'direct', embedUrl: url }
}

export function VideoCinema({ videos, defaultVideoId, defaultTitle }: VideoCinemaProps) {
  const allVideos: VideoItem[] = videos && videos.length > 0
    ? videos
    : [
        {
          id: 'def-1',
          title: defaultTitle || 'Nuestra Historia de Amor',
          url: defaultVideoId || '2Vv-BfVoq4g',
          platform: 'youtube',
          category: 'Tráiler Principal'
        }
      ]

  const [activeVideo, setActiveVideo] = useState<VideoItem>(allVideos[0])
  const parsed = parseVideoUrl(activeVideo.url)

  return (
    <section id="videos" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#180d16] via-[#241126] to-[#120815] text-white overflow-hidden relative">
      {/* GLOWING AMBIENT LIGHTS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-600/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-500/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="section-eyebrow mb-2 reveal" style={{ color: '#f7e7c4' }}>
            🎬 Sala de Cine · Momentos Mágicos 🎬
          </p>
          <h2 className="section-title reveal" style={{ color: '#ffffff' }}>
            Nuestra Historia en <em>Video</em>
          </h2>
          <p className="section-subtitle mt-3 reveal" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
            Revive con nosotros los instantes que marcaron el camino hacia el día más soñado
          </p>
        </div>

        {/* MAIN CINEMA SCREEN */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black/60 backdrop-blur-xl mb-8 reveal">
          <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
            {parsed.type === 'direct' ? (
              <video
                controls
                autoPlay
                className="absolute inset-0 w-full h-full object-cover"
                src={parsed.embedUrl}
              />
            ) : (
              <iframe
                className="absolute inset-0 w-full h-full border-none"
                src={parsed.embedUrl}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          <div className="p-4 sm:p-6 bg-stone-900/90 flex items-center justify-between flex-wrap gap-4 border-t border-white/10">
            <div>
              <span className="text-[0.68rem] font-bold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                {activeVideo.category || 'En Reproducción'}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-2">
                {activeVideo.title}
              </h3>
            </div>
            <span className="text-xs text-white/50 flex items-center gap-1.5">
              <span>HD 1080p</span> · <span>Dolby Sound</span>
            </span>
          </div>
        </div>

        {/* VIDEO PLAYLIST CARDS */}
        {allVideos.length > 1 && (
          <div className="reveal">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300/80 mb-4">
              Más videos de la pareja
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allVideos.map((vid, idx) => (
                <button
                  key={vid.id || idx}
                  onClick={() => setActiveVideo(vid)}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    activeVideo.id === vid.id
                      ? 'bg-white/20 border-2 border-amber-400 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                    ▶
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[0.65rem] text-amber-300 uppercase tracking-wider font-bold">
                      {vid.category || 'Video'}
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
