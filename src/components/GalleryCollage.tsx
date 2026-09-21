import { useState, useEffect } from 'react'
import type { GalleryPhoto } from '../types/wedding'

interface GalleryCollageProps {
  photos: GalleryPhoto[]
}

const CATEGORIES = [
  { id: 'todas', label: 'Todas las fotos 📸' },
  { id: 'historia', label: 'Nuestra Historia 💕' },
  { id: 'preboda', label: 'Sesión Pre-Boda 🌅' },
  { id: 'civil', label: 'Civil & Familia 🥂' },
  { id: 'fiesta', label: 'Celebración 🎉' },
]

export function GalleryCollage({ photos }: GalleryCollageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('todas')
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null)

  const filteredPhotos = activeCategory === 'todas'
    ? photos
    : photos.filter(p => (p.category || 'historia') === activeCategory)

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIdx === null) return
      if (e.key === 'Escape') setActivePhotoIdx(null)
      if (e.key === 'ArrowRight') nextPhoto()
      if (e.key === 'ArrowLeft') prevPhoto()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePhotoIdx, filteredPhotos.length])

  const nextPhoto = () => {
    if (activePhotoIdx === null) return
    setActivePhotoIdx((activePhotoIdx + 1) % filteredPhotos.length)
  }

  const prevPhoto = () => {
    if (activePhotoIdx === null) return
    setActivePhotoIdx((activePhotoIdx - 1 + filteredPhotos.length) % filteredPhotos.length)
  }

  const currentLightboxPhoto = activePhotoIdx !== null ? filteredPhotos[activePhotoIdx] : null

  return (
    <section id="galeria" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-50 via-pink-50/30 to-amber-50/20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="section-eyebrow mb-2 reveal">📸 Recuerdos que Trascienden 📸</p>
          <h2 className="section-title reveal">
            Galería & <em>Collage</em> de Amor
          </h2>
          <p className="section-subtitle mt-3 reveal">
            Imágenes que capturan la complicidad, la alegría y la bendición de caminar juntos hacia el altar
          </p>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 reveal">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-rose-400 text-white shadow-md shadow-pink-300/40 scale-105'
                    : 'bg-white text-stone-600 hover:bg-pink-50 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ASYMMETRIC MASONRY COLLAGE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[220px] reveal">
          {filteredPhotos.map((photo, i) => {
            // Asymmetric span styling to make it a pro collage
            const isSpanLarge = i % 7 === 0
            const isSpanTall = i % 5 === 1
            const isSpanWide = i % 6 === 2

            const spanClass = isSpanLarge
              ? 'sm:col-span-2 sm:row-span-2'
              : isSpanTall
              ? 'row-span-2'
              : isSpanWide
              ? 'sm:col-span-2'
              : ''

            return (
              <div
                key={photo.id || i}
                onClick={() => setActivePhotoIdx(i)}
                className={`group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-xl cursor-pointer transition-all duration-500 hover:-translate-y-1 ${spanClass}`}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto de Boda'}
                  style={{ objectPosition: photo.objectPosition || 'center' }}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />

                {/* OVERLAY ON HOVER */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <span className="text-amber-300 text-[0.65rem] font-bold uppercase tracking-widest mb-1">
                    {photo.category || 'Boda'}
                  </span>
                  {photo.caption && (
                    <p className="text-white text-sm font-display font-medium line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-white/80 text-xs">
                    <span>🔍 Ampliar</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CINEMATIC LIGHTBOX */}
        {activePhotoIdx !== null && currentLightboxPhoto && (
          <div
            className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 select-none"
            onClick={() => setActivePhotoIdx(null)}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setActivePhotoIdx(null)}
              className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white text-xl flex items-center justify-center transition-all border border-white/20 cursor-pointer"
            >
              ✕
            </button>

            {/* PREVIOUS BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevPhoto()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white text-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            >
              ‹
            </button>

            {/* NEXT BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextPhoto()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white text-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            >
              ›
            </button>

            {/* IMAGE & DETAILS */}
            <div
              className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={currentLightboxPhoto.url}
                alt=""
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />

              {/* FOOTER INFO */}
              <div className="mt-4 text-center max-w-xl px-4">
                <span className="text-[0.68rem] uppercase font-bold tracking-widest text-amber-300/80 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  Foto {activePhotoIdx + 1} de {filteredPhotos.length}
                </span>
                {currentLightboxPhoto.caption && (
                  <p className="text-white text-base font-display font-medium mt-2">
                    {currentLightboxPhoto.caption}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
