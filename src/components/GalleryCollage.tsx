import { useState, useEffect, useRef } from 'react'
import type { GalleryPhoto } from '../types/wedding'

interface GalleryCollageProps {
  photos: GalleryPhoto[]
}

const CATEGORY_DEFS = [
  { id: 'todas', label: 'Todas las Memorias', icon: '🌟' },
  { id: 'preboda', label: 'Sesión Pre-Boda', icon: '🌅' },
  { id: 'historia', label: 'Historia & Emma', icon: '💕' },
  { id: 'civil', label: 'Familia & Gala', icon: '🥂' },
]

export function GalleryCollage({ photos }: GalleryCollageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('todas')
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'correventanas' | 'mosaico'>('correventanas')
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number>(0)

  // Curar y filtrar fotos válidas (evitando URLs rotas)
  const validPhotos = photos && photos.length > 0 ? photos : []

  const filteredPhotos =
    activeCategory === 'todas'
      ? validPhotos
      : validPhotos.filter((p) => (p.category || 'preboda') === activeCategory)

  // Reset index cuando cambia la categoría
  useEffect(() => {
    setCurrentIndex(0)
  }, [activeCategory])

  const total = filteredPhotos.length

  // Correventanas: movimiento suave automático si no se interactúa
  useEffect(() => {
    if (!isAutoPlaying || isHovered || total <= 1 || lightboxPhoto !== null) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total)
    }, 3800)
    return () => clearInterval(timer)
  }, [isAutoPlaying, isHovered, total, lightboxPhoto])

  // Navegación por teclado en Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxPhoto) return
      if (e.key === 'Escape') setLightboxPhoto(null)
      if (e.key === 'ArrowRight') {
        const nextIdx = (lightboxIndex + 1) % total
        setLightboxIndex(nextIdx)
        setLightboxPhoto(filteredPhotos[nextIdx])
      }
      if (e.key === 'ArrowLeft') {
        const prevIdx = (lightboxIndex - 1 + total) % total
        setLightboxIndex(prevIdx)
        setLightboxPhoto(filteredPhotos[prevIdx])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxPhoto, lightboxIndex, total, filteredPhotos])

  const handleNext = () => {
    if (total === 0) return
    setCurrentIndex((prev) => (prev + 1) % total)
    setIsAutoPlaying(false) // Al tocar manualmente, obedece al usuario
  }

  const handlePrev = () => {
    if (total === 0) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
    setIsAutoPlaying(false) // Al tocar manualmente, obedece al usuario
  }

  const openLightbox = (photo: GalleryPhoto, idx: number) => {
    setLightboxPhoto(photo)
    setLightboxIndex(idx)
  }

  // Ref para deslizar las ventanitas de carrete
  const sliderTrackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sliderTrackRef.current && total > 0) {
      const activeWindow = sliderTrackRef.current.children[currentIndex] as HTMLElement
      if (activeWindow) {
        activeWindow.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      }
    }
  }, [currentIndex, total])

  return (
    <section
      id="galeria"
      className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#13071b] via-[#210c2e] to-[#120718] text-white relative overflow-hidden"
    >
      {/* LUCES AMBIENTALES RADIALES */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-pink-600/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-purple-600/15 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* CABECERA DE LA SECCIÓN */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs font-bold uppercase tracking-[0.25em] mb-4 shadow-lg">
            <span>📸</span>
            <span>Álbum de Recuerdos &bull; Correventanas Exclusivo</span>
            <span>✨</span>
          </div>

          <h2 className="font-script text-white text-4xl sm:text-6xl font-bold drop-shadow-md">
            Galería &amp; <em className="italic text-[#fae8c8]">Momentos Inolvidables</em>
          </h2>

          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Fotografías ordenadas por momentos y sesiones. Cada imagen conserva su proporción perfecta sin distorsión ni extensiones forzadas.
          </p>

          {/* CONTROLES SUPERIORES: FILTROS DE CATEGORÍA Y ALTERNADOR DE VISTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-white/10 max-w-5xl mx-auto">
            {/* PESTAÑAS DE CATEGORÍA CON CONTEO */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {CATEGORY_DEFS.map((cat) => {
                const count =
                  cat.id === 'todas'
                    ? validPhotos.length
                    : validPhotos.filter((p) => (p.category || 'preboda') === cat.id).length
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id)
                      setIsAutoPlaying(true)
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white shadow-lg shadow-amber-500/20 scale-105 border border-white/40'
                        : 'bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        isActive ? 'bg-black/30 text-amber-200' : 'bg-white/10 text-stone-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* SELECTOR DE MODO: CORREVENTANAS VS MOSAICO */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode('correventanas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'correventanas'
                    ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Vista Ventanas Corredizas (Correventanas)"
              >
                <span>🪟</span>
                <span>Correventanas</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('mosaico')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'mosaico'
                    ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Vista Cuadrícula Mosaico"
              >
                <span>🖼️</span>
                <span>Mosaico</span>
              </button>
            </div>
          </div>
        </div>

        {total === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl bg-white/5 border border-white/10 text-stone-400 max-w-md mx-auto">
            <span className="text-4xl block mb-2">📸</span>
            <p className="text-sm font-medium">No hay fotos en esta sección por el momento.</p>
          </div>
        ) : viewMode === 'correventanas' ? (
          /* ═══════════════════════════════════════════════════════════
             MODO 1: CORREVENTANAS PANORÁMICO (VENTANAS DESLIZANTES)
             ═══════════════════════════════════════════════════════════ */
          <div
            className="space-y-6"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* VENTANA PRINCIPAL CENTRAL EN ALTA DEFINICIÓN (PROPORCIÓN PERFECTA 16:10) */}
            <div className="relative rounded-3xl overflow-hidden p-2 sm:p-3 bg-gradient-to-tr from-amber-400/30 via-purple-500/20 to-pink-500/30 border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group">
              {/* ESQUINEROS DORADOS DECORATIVOS */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-amber-300 rounded-tl-lg pointer-events-none z-20" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-amber-300 rounded-tr-lg pointer-events-none z-20" />
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-amber-300 rounded-bl-lg pointer-events-none z-20" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-amber-300 rounded-br-lg pointer-events-none z-20" />

              {/* CONTENEDOR CON PROPORCIÓN FIJA (SIN DEFORMAR NI ESTIRAR) */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[540px] rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center">
                {/* FONDO DIFUMINADO SUTIL PARA FOTOS CON RELACIONES DE ASPECTO DISTINTAS */}
                <div
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-110"
                  style={{ backgroundImage: `url(${filteredPhotos[currentIndex]?.url})` }}
                />

                {/* IMAGEN PRINCIPAL FOCALIZADA */}
                <img
                  key={filteredPhotos[currentIndex]?.url}
                  src={filteredPhotos[currentIndex]?.url}
                  alt={filteredPhotos[currentIndex]?.caption || 'Recuerdo de la boda'}
                  style={{
                    objectPosition: filteredPhotos[currentIndex]?.objectPosition || 'center center',
                  }}
                  className="relative z-10 w-full h-full object-contain cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
                  onClick={() => openLightbox(filteredPhotos[currentIndex], currentIndex)}
                />

                {/* DEGRADADO SUTIL INFERIOR */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none z-15" />

                {/* INSIGNIA SUPERIOR */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                  <div className="bg-black/65 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-300/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-xl">
                    <span>✨</span>
                    <span>
                      Ventana {currentIndex + 1} de {total}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openLightbox(filteredPhotos[currentIndex], currentIndex)}
                    className="bg-black/65 hover:bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xl hover:scale-105"
                  >
                    <span>🔍</span>
                    <span>Ampliar HD</span>
                  </button>
                </div>

                {/* BOTONES LATERALES DE CORREDERA */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/30 text-white flex items-center justify-center text-xl backdrop-blur-md transition-all duration-300 hover:scale-110 z-20 cursor-pointer shadow-2xl active:scale-95"
                  title="Foto Anterior (Deslizar ventana izquierda)"
                >
                  ◀
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/30 text-white flex items-center justify-center text-xl backdrop-blur-md transition-all duration-300 hover:scale-110 z-20 cursor-pointer shadow-2xl active:scale-95"
                  title="Siguiente Foto (Deslizar ventana derecha)"
                >
                  ▶
                </button>

                {/* TARJETA INFERIOR DE DETALLE */}
                <div className="absolute bottom-4 left-4 right-4 z-20 p-4 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/20 text-left shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30 inline-block mb-1">
                      {filteredPhotos[currentIndex]?.category?.toUpperCase() || 'MOMENTO ESPECIAL'}
                    </span>
                    <h4 className="font-display text-base sm:text-lg font-bold text-white leading-snug">
                      {filteredPhotos[currentIndex]?.caption || 'Luis Quispe & Victoria Choque · Memoria de Amor'}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-stone-200 transition flex items-center gap-1.5 cursor-pointer"
                      title={isAutoPlaying ? 'Pausar correventanas automático' : 'Activar correventanas automático'}
                    >
                      <span>{isAutoPlaying ? '⏸️' : '▶️'}</span>
                      <span className="hidden sm:inline">
                        {isAutoPlaying ? 'Pausar Corredera' : 'Auto-Corredera'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CARRIL DE VENTANAS CORREDIZAS INFERIOR (VENTANITAS ORDENADAS) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400 px-2">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-300">🪟</span>
                  <span className="font-medium">Ventanitas Corredizas (Haz clic en cualquier foto para deslizar la ventana)</span>
                </span>
                <span className="text-[11px] text-stone-400">
                  {isAutoPlaying && !isHovered ? '✨ Deslizándose automáticamente' : '🖐️ Control manual activo'}
                </span>
              </div>

              <div
                ref={sliderTrackRef}
                className="flex items-center gap-3 overflow-x-auto py-3 px-2 no-scrollbar scroll-smooth"
              >
                {filteredPhotos.map((photo, idx) => {
                  const isCurrent = idx === currentIndex
                  return (
                    <button
                      key={photo.id || idx}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx)
                        setIsAutoPlaying(false) // Al hacer clic manual, obedece fielmente
                      }}
                      className={`relative flex-shrink-0 w-28 sm:w-36 aspect-[16/10] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border-2 bg-black/60 ${
                        isCurrent
                          ? 'border-amber-400 scale-105 shadow-[0_0_25px_rgba(251,191,36,0.6)] ring-2 ring-amber-300/60'
                          : 'border-white/15 opacity-60 hover:opacity-100 hover:scale-100'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`Ventanita ${idx + 1}`}
                        style={{ objectPosition: photo.objectPosition || 'center center' }}
                        className="w-full h-full object-cover"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-md animate-ping" />
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-black text-amber-300">
                        #{idx + 1}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════
             MODO 2: MOSAICO ESTRUCTURADO (PROPORCIÓN UNIFORME SIN ESTIRAR)
             ═══════════════════════════════════════════════════════════ */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredPhotos.map((photo, idx) => (
              <div
                key={photo.id || idx}
                onClick={() => openLightbox(photo, idx)}
                className="group relative rounded-3xl overflow-hidden bg-black/50 border border-white/15 shadow-xl hover:shadow-2xl hover:border-amber-400/60 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* CONTENEDOR CON RELACIÓN DE ASPECTO FIJA PARA QUE NO SE EXTROPIE */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-950 flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-110"
                    style={{ backgroundImage: `url(${photo.url})` }}
                  />
                  <img
                    src={photo.url}
                    alt={photo.caption || `Foto ${idx + 1}`}
                    style={{ objectPosition: photo.objectPosition || 'center center' }}
                    className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-15" />

                  {/* BADGE NÚMERO */}
                  <span className="absolute top-3 left-3 z-20 text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-full border border-amber-300/30">
                    #{idx + 1} &bull; {photo.category || 'Recuerdo'}
                  </span>

                  {/* BOTÓN LUPA */}
                  <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    🔍
                  </div>
                </div>

                {/* PIE DE FOTO ESTRUCTURADO */}
                <div className="p-4 bg-gradient-to-b from-black/60 to-black/90 border-t border-white/10">
                  <p className="text-xs font-semibold text-white/90 truncate">
                    {photo.caption || 'Celebración del amor de Luis & Victoria'}
                  </p>
                  <span className="text-[10px] text-amber-300/80 font-bold mt-0.5 block">
                    Haz clic para ampliar en alta resolución &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
         MODAL LIGHTBOX FULLSCREEN (PANTALLA COMPLETA CON ZOOM Y TECLADO)
         ═══════════════════════════════════════════════════════════ */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 sm:p-8 animate-fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          {/* BOTÓN CERRAR */}
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition cursor-pointer z-30"
          >
            ✕
          </button>

          {/* BOTÓN ANTERIOR */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              const prevIdx = (lightboxIndex - 1 + total) % total
              setLightboxIndex(prevIdx)
              setLightboxPhoto(filteredPhotos[prevIdx])
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl flex items-center justify-center transition cursor-pointer z-30 shadow-2xl"
          >
            ◀
          </button>

          {/* BOTÓN SIGUIENTE */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              const nextIdx = (lightboxIndex + 1) % total
              setLightboxIndex(nextIdx)
              setLightboxPhoto(filteredPhotos[nextIdx])
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl flex items-center justify-center transition cursor-pointer z-30 shadow-2xl"
          >
            ▶
          </button>

          {/* FOTO CENTRAL EN ALTA RESOLUCIÓN */}
          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.caption || 'Foto de boda'}
              style={{ objectPosition: lightboxPhoto.objectPosition || 'center center' }}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <div className="mt-4 text-center max-w-2xl px-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30">
                Foto {lightboxIndex + 1} de {total} &bull; {lightboxPhoto.category?.toUpperCase() || 'RECUERDO'}
              </span>
              <p className="text-white text-sm sm:text-base font-semibold mt-2">
                {lightboxPhoto.caption || 'Luis Quispe & Victoria Choque · 24 de Octubre de 2026'}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
