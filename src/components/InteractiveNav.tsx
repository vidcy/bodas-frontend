import { useState, useEffect, useRef } from 'react'
import type { WeddingData } from '../types/wedding'

interface InteractiveNavProps {
  data: WeddingData
  onOpenAdmin: () => void
  petalsEnabled: boolean
  onTogglePetals: () => void
  playing: boolean
  onToggleMusic: () => void
  isMuted: boolean
  onToggleMute: () => void
  needsGesture: boolean
}

const NAV_LINKS = [
  { href: '#invitacion-oficial', label: 'Invitación 📜' },
  { href: '#historia', label: 'Historia 💕' },
  { href: '#galeria', label: 'Galería 📸' },
  { href: '#videos', label: 'Videos 🎬' },
  { href: '#artistas', label: 'Artistas 🎤' },
  { href: '#programa', label: 'Programa 🗓️' },
  { href: '#lugar', label: 'Lugares 📍' },
  { href: '#dresscode', label: 'Dress Code 👗' },
  { href: '#regalos', label: 'Lluvia de Sobres 🎁' },
  { href: '#foro-deseos', label: 'Libro de Firmas ✍️' },
  { href: '#faq', label: 'Preguntas ❓' },
  { href: '#rsvp', label: 'RSVP 💌' },
]

export function InteractiveNav({
  data,
  onOpenAdmin,
  petalsEnabled,
  onTogglePetals,
  playing,
  onToggleMusic,
  isMuted,
  onToggleMute,
  needsGesture,
}: InteractiveNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollNav = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const offset = direction === 'left' ? -220 : 220
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <nav
      className={`w-full transition-all duration-300 px-3 sm:px-6 lg:px-8 select-none ${
        scrolled
          ? 'py-2 bg-white/95 backdrop-blur-xl shadow-lg border-b border-purple-100'
          : 'py-3.5 bg-white/85 backdrop-blur-md border-b border-white/50'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* LOGO COUPLE */}
        <a
          href="#"
          className="font-script text-2xl sm:text-3xl font-bold whitespace-nowrap hover:scale-105 transition-transform flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {data.groomName} &amp; {data.brideName}
        </a>

        {/* INTERACTIVE CAROUSEL SLIDER LINKS (DESKTOP / TABLET) */}
        <div className="hidden lg:flex items-center gap-1.5 flex-1 max-w-2xl mx-2 relative min-w-0">
          {/* SCROLL LEFT BUTTON */}
          <button
            type="button"
            onClick={() => scrollNav('left')}
            className="w-7 h-7 rounded-full bg-white shadow-md border border-purple-200 text-purple-700 hover:bg-purple-100 flex items-center justify-center text-sm font-bold flex-shrink-0 cursor-pointer transition-all hover:scale-110 z-10"
            title="Ver enlaces anteriores"
          >
            ‹
          </button>

          {/* GRADIENT FADE LEFT */}
          <div className="absolute left-7 top-0 bottom-0 w-4 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-10" />

          {/* SCROLLABLE CONTAINER */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto py-1 px-3 scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-purple-50/70 hover:bg-purple-100 text-purple-900 border border-purple-200/60 transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-xs"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* GRADIENT FADE RIGHT */}
          <div className="absolute right-7 top-0 bottom-0 w-4 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-10" />

          {/* SCROLL RIGHT BUTTON */}
          <button
            type="button"
            onClick={() => scrollNav('right')}
            className="w-7 h-7 rounded-full bg-white shadow-md border border-purple-200 text-purple-700 hover:bg-purple-100 flex items-center justify-center text-sm font-bold flex-shrink-0 cursor-pointer transition-all hover:scale-110 z-10"
            title="Ver más opciones"
          >
            ›
          </button>
        </div>

        {/* RIGHT CONTROLS: MUSIC PLAYER + PETALS + ADMIN */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* MUSIC PILL WITH SOUND WAVE */}
          <div className="flex items-center gap-1 bg-purple-50/90 backdrop-blur-md p-1 rounded-full border border-purple-200/80 shadow-sm">
            <button
              id="music-btn"
              type="button"
              onClick={onToggleMusic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[0.68rem] font-bold tracking-wider uppercase transition-all duration-300 shadow cursor-pointer ${
                playing
                  ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 animate-pulse'
                  : needsGesture
                  ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 animate-bounce'
                  : 'bg-stone-600 hover:bg-stone-700'
              }`}
              title={playing ? "Pausar música" : "Reproducir música"}
            >
              {playing ? (
                <>
                  <div className="music-bar">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="music-bar-item bg-white" />
                    ))}
                  </div>
                  <span className="hidden sm:inline">Pausar</span>
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>{needsGesture ? 'Activar Música' : 'Música'}</span>
                </>
              )}
            </button>

            {/* MUTE BUTTON */}
            <button
              type="button"
              onClick={onToggleMute}
              className="w-7 h-7 rounded-full bg-white hover:bg-purple-100 text-purple-800 text-xs flex items-center justify-center transition-colors border border-purple-200 cursor-pointer"
              title={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* PETALS TOGGLE */}
          <button
            type="button"
            onClick={onTogglePetals}
            className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full border text-xs transition-colors cursor-pointer ${
              petalsEnabled
                ? 'bg-purple-100 border-purple-300 text-purple-800'
                : 'bg-stone-100 border-stone-200 text-stone-400'
            }`}
            title="Activar/desactivar pétalos flotantes"
          >
            🌸
          </button>

          {/* ADMIN PORTAL TRIGGER */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:scale-105 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #d97706)' }}
            title="Panel de Administración"
          >
            <span>👑</span>
            <span className="hidden md:inline">Admin</span>
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="lg:hidden w-8 h-8 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center font-bold text-base cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenu ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN ACCORDION */}
      {mobileMenu && (
        <div className="lg:hidden bg-white/95 backdrop-blur-2xl rounded-2xl p-4 mt-2.5 border border-purple-100 shadow-xl grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenu(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-purple-950 bg-purple-50/70 hover:bg-purple-100 transition-colors text-center"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
