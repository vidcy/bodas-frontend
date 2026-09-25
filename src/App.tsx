import { useState, useEffect, createContext, useContext } from 'react'
import './index.css'
import {
  DEFAULT_WEDDING,
  loadWeddingData,
  loadWeddingDataAsync,
  saveWeddingData,
  type WeddingData
} from './wedding-config'
import type { GuestbookMessage } from './types/wedding'
import { useCountdown, useScrollReveal, useMusic } from './hooks'

import { AnnouncementBanner } from './components/AnnouncementBanner'
import { InteractiveNav } from './components/InteractiveNav'
import { StoriesBar } from './components/StoriesBar'
import { InvitationCardSection } from './components/InvitationCardSection'
import { GalleryCollage } from './components/GalleryCollage'
import { VideoCinema } from './components/VideoCinema'
import { DressCodeGuide } from './components/DressCodeGuide'
import { FaqSection } from './components/FaqSection'
import { GuestbookSection } from './components/GuestbookSection'
import { AdminPortal } from './components/AdminPortal/AdminPortal'
import { RsvpFormSection } from './components/RsvpFormSection'
import { BackendStatusBadge } from './components/BackendStatusBadge'
import { DidacticScheduleSection } from './components/DidacticScheduleSection'
import { WeddingLiveChat } from './components/WeddingLiveChat'
import { getGoogleCalendarUrl, downloadIcsCalendar } from './utils/calendarHelper'
import { SafeImage } from './components/SafeImage'
import coupleImg from './assets/couple.jpg'
import { likeGuestbookMessageInBackend, deleteGuestbookMessageFromBackend, submitGuestbookMessageToBackend } from './utils/storageService'

// ── WEDDING DATA CONTEXT ─────────────────────────────────────
const WeddingCtx = createContext<{
  data: WeddingData
  setData: (d: WeddingData) => void
}>({ data: DEFAULT_WEDDING, setData: () => {} })

const useWedding = () => useContext(WeddingCtx)

// ── FLOATING PETALS & PARTICLES ──────────────────────────────
function FloatingPetals({ enabled }: { enabled: boolean }) {
  if (!enabled) return null
  const petals = ['🪻', '🌸', '💐', '✨', '🌹', '💜', '🤍', '💍']
  return (
    <div className="fixed inset-0 pointer-events-none z-[9990] overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-petal-fall select-none"
          style={{
            left: `${(i * 5) % 100}%`,
            animationDuration: `${7 + (i % 5) * 1.5}s`,
            animationDelay: `${(i * 0.7) % 10}s`,
            fontSize: `${0.75 + (i % 4) * 0.3}rem`,
            opacity: 0.75,
          }}
        >
          {petals[i % petals.length]}
        </span>
      ))}
    </div>
  )
}

// ── STARS BACKGROUND ─────────────────────────────────────────
function StarsBackground({ count = 50 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            width: `${1.5 + (i % 3)}px`,
            height: `${1.5 + (i % 3)}px`,
            top: `${(i * 19) % 100}%`,
            left: `${(i * 23) % 100}%`,
            animationDelay: `${(i * 0.3) % 4}s`,
            animationDuration: `${2 + (i % 3)}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── HERO SECTION (CON RETRATO DE LUZ DE LOS NOVIOS Y AMPLIOS ESPACIOS) ──────────
function HeroSection() {
  const { data } = useWedding()
  const weddingDate = new Date(data.weddingDate)
  const dateStr = weddingDate.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-44 sm:pt-48 md:pt-52 lg:pt-48 pb-20 px-4 sm:px-6 lg:px-8">
      {/* AMBIENT BG IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-hero-zoom opacity-45"
        style={{
          backgroundImage: `url(${data.heroBannerUrl || data.mainCouplePhoto})`,
          objectPosition: data.heroPhotoPosition || 'center 30%',
        }}
      />

      {/* RADIANT AMBIENT GRADIENT VIVO Y LUMINOSO */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 80% 25%, rgba(251, 191, 36, 0.45) 0%, transparent 55%), radial-gradient(circle at 20% 75%, rgba(244, 114, 182, 0.4) 0%, transparent 55%), radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.3) 0%, transparent 60%), linear-gradient(135deg, rgba(28, 8, 38, 0.88) 0%, rgba(58, 14, 72, 0.76) 50%, rgba(24, 7, 34, 0.9) 100%)',
        }}
      />

      {/* PARTICLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${35 + (i % 4) * 20}px`,
              height: `${35 + (i % 4) * 20}px`,
              left: `${(i * 6.5) % 100}%`,
              bottom: '-10%',
              animationDelay: `${(i * 0.7) % 10}s`,
              animationDuration: `${10 + (i % 3) * 3}s`,
            }}
          />
        ))}
      </div>

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* LEFT COLUMN: TYPOGRAPHY & DETAILS */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-purple-300/40 text-amber-300 text-xs font-bold uppercase tracking-[0.22em] shadow-lg">
            <span>✨</span>
            <span>Matrimonio Religioso &amp; Civil &bull; {data.hashtag}</span>
          </div>

          <div>
            <p className="text-white/80 font-display italic text-lg sm:text-xl mb-1">
              Con la bendición de Dios y nuestras familias
            </p>
            <h1
              className="font-script text-white text-hero-shadow leading-none"
              style={{ fontSize: 'clamp(4.2rem, 11vw, 7.8rem)', fontWeight: 700 }}
            >
              {data.groomName}
              <span className="inline-block mx-3 text-[0.5em] text-[#fae8c8] font-display italic">
                &amp;
              </span>
              {data.brideName}
            </h1>
          </div>

          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-amber-400/40 via-purple-400/40 to-amber-400/40 border border-white/20">
            <div className="px-5 py-2 rounded-xl bg-black/40 backdrop-blur-md">
              <p className="text-amber-300 font-display font-bold text-base sm:text-xl capitalize">
                📅 {dateStr} &bull; 8:00 A.M.
              </p>
              <p className="text-white/70 text-xs mt-0.5 font-medium">
                Iglesia Señor Qoyllority &bull; Recepción: Local &ldquo;El Golazo&rdquo;
              </p>
            </div>
          </div>

          <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
            &ldquo;{data.tagline}. Acompáñanos a celebrar el día en que uniremos nuestras vidas para siempre.&rdquo;
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
            <a href="#invitacion-oficial" className="btn-gold shadow-xl">
              📜 Ver Invitación Oficial
            </a>
            <a href="#countdown" className="btn-gold btn-rose">
              ⏳ Cuenta Regresiva
            </a>
            <a href="#rsvp" className="btn-gold btn-white">
              💌 Confirmar Asistencia
            </a>
            <button
              onClick={() => window.open(getGoogleCalendarUrl(data), '_blank')}
              className="btn-gold shadow-lg flex items-center gap-1.5 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.35)',
              }}
              title="Guardar en Google Calendar"
            >
              <span>📅</span>
              <span>Agendar Fecha</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: EL RETRATO DE LUZ DE LOS NOVIOS */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md">
            {/* RADIANT HALO BACKLIGHTING */}
            <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-amber-400/60 via-purple-500/50 to-pink-400/60 blur-3xl opacity-80 animate-pulse-glow" />

            {/* LUXURY GLASS CARD */}
            <div className="relative rounded-[36px] p-3.5 bg-white/15 backdrop-blur-2xl border-2 border-amber-300/80 shadow-[0_0_60px_rgba(217,119,6,0.35)] overflow-hidden group">
              {/* GOLD CORNER ACCENTS */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-300 rounded-tl-xl pointer-events-none z-20" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-300 rounded-tr-xl pointer-events-none z-20" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-300 rounded-bl-xl pointer-events-none z-20" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-300 rounded-br-xl pointer-events-none z-20" />

              {/* IMAGE CONTAINER WITH FOCAL POINT CENTERING */}
              <div className="relative h-[440px] sm:h-[500px] w-full rounded-[28px] overflow-hidden bg-black/40">
                <SafeImage
                  src={data.mainCouplePhoto}
                  fallbackSrc={coupleImg}
                  alt={`${data.groomName} y ${data.brideName}`}
                  style={{ objectPosition: data.couplePhotoPosition || 'center 20%' }}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                />

                {/* SUBTLE ILLUMINATED OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* FLOATING TOP BADGE */}
                <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-300/60 flex items-center gap-1.5 shadow-lg">
                  <span className="text-base animate-heartbeat">💍</span>
                  <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                    ¡Nos Casamos!
                  </span>
                </div>

                {/* FLOATING BOTTOM CAPTION */}
                <div className="absolute bottom-4 left-4 right-4 z-20 p-3.5 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 text-center shadow-xl">
                  <h3 className="font-script text-2xl sm:text-3xl text-white font-bold drop-shadow">
                    {data.groomName} &amp; {data.brideName}
                  </h3>
                  <p className="text-[0.68rem] text-amber-200 uppercase font-extrabold tracking-widest mt-0.5">
                    Un solo corazón &bull; 24 Octubre 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── COUNTDOWN ────────────────────────────────────────────────
function CountdownSection() {
  const { data } = useWedding()
  const time = useCountdown(data.weddingDate)
  const units = [
    { label: 'Días', value: time.days },
    { label: 'Horas', value: time.hours },
    { label: 'Minutos', value: time.minutes },
    { label: 'Segundos', value: time.seconds },
  ]

  return (
    <section
      id="countdown"
      className="relative py-20 px-4 sm:px-6 text-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f7f2fc 0%, #fffdfa 50%, #fdf6ea 100%)',
      }}
    >
      <div className="relative z-10 max-w-4xl mx-auto">
        <p className="section-eyebrow mb-2 reveal" style={{ color: '#8b5cf6' }}>
          ✨ El Momento Más Esperado ✨
        </p>
        <h2 className="section-title reveal">
          Cuenta <em>Regresiva</em>
        </h2>
        <p className="section-subtitle mt-3 mb-10 reveal">
          Cada segundo que pasa nos acerca al 24 de Octubre de 2026, el día en que uniremos nuestras vidas ante Dios y nuestra familia
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 reveal">
          {units.map(u => (
            <div
              key={u.label}
              className="gradient-card rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-100 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  background: 'linear-gradient(to right, #9b72cf, #d4af37, #c8b6ff)',
                }}
              />
              <span className="countdown-digit block">
                {String(u.value).padStart(2, '0')}
              </span>
              <span
                className="block text-[0.7rem] font-extrabold tracking-[0.22em] uppercase mt-2"
                style={{ color: '#6b21a8' }}
              >
                {u.label}
              </span>
            </div>
          ))}
        </div>

        {/* CALENDAR SHORTCUTS */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 reveal">
          <a
            href={getGoogleCalendarUrl(data)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-purple-950 bg-white border border-purple-200 shadow-md hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>📅</span>
            <span>Agregar a Google Calendar</span>
          </a>
          <button
            onClick={() => downloadIcsCalendar(data)}
            className="px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-purple-950 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>🍏</span>
            <span>Descargar iCal / Outlook (.ics)</span>
          </button>
        </div>
      </div>
    </section>
  )
}

// ── LOVE STORY ───────────────────────────────────────────────
function LoveStorySection() {
  const { data } = useWedding()
  return (
    <section
      id="historia"
      className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#fffdfa]"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-2 reveal" style={{ color: '#8b5cf6' }}>
            💕 Nuestro Camino Juntos 💕
          </p>
          <h2 className="section-title reveal">
            Nuestra Historia de <em>Amor</em>
          </h2>
          <p className="section-subtitle mt-3 reveal">
            {data.coupleDescription}
          </p>
        </div>

        <div className="relative">
          {/* TIMELINE LINE */}
          <div
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
            style={{
              background:
                'linear-gradient(to bottom, transparent, #9b72cf, #d4af37, #c8b6ff, transparent)',
            }}
          />

          <div className="space-y-12">
            {data.loveStory.map((item, idx) => {
              const isEven = idx % 2 === 0
              return (
                <div
                  key={idx}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-6 relative reveal ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* CARD */}
                  <div
                    className={`w-full md:w-[45%] pl-14 md:pl-0 ${
                      isEven ? 'md:text-left' : 'md:text-right'
                    }`}
                  >
                    <div className="gradient-card rounded-3xl p-6 sm:p-8 shadow-md border border-purple-100 hover:shadow-xl transition-all">
                      <span className="text-[0.7rem] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        {item.year}
                      </span>
                      <h4 className="font-display text-xl font-bold text-stone-800 mt-3 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* CENTER BADGE */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-300 via-purple-300 to-pink-300 p-0.5 shadow-lg flex items-center justify-center z-10">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-lg">
                      {item.emoji || '💖'}
                    </div>
                  </div>

                  <div className="hidden md:block w-[45%]" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── ARTISTS SECTION ──────────────────────────────────────────
function ArtistsSection() {
  const { data } = useWedding()
  return (
    <section
      id="artistas"
      className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #190a28 0%, #2e1045 50%, #150926 100%)',
      }}
    >
      <StarsBackground count={60} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-2 reveal" style={{ color: '#fae8c8' }}>
            🎤 Música & Entretenimiento 🎤
          </p>
          <h2 className="section-title reveal" style={{ color: '#ffffff' }}>
            Artistas & Orquestas <em>en Vivo</em>
          </h2>
          <p
            className="section-subtitle mt-3 reveal"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Una celebración inolvidable con la mejor orquesta y grupos en vivo para celebrar el amor de Luis & Victoria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.artists.map((artist, idx) => (
            <div
              key={idx}
              className="glass-panel-dark rounded-3xl overflow-hidden reveal group hover:-translate-y-2 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 sm:h-52 bg-gradient-to-tr from-purple-900/60 via-amber-900/50 to-stone-900 flex items-center justify-center overflow-hidden">
                {artist.photo ? (
                  <img
                    src={artist.photo}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-6xl">
                    {['🎺', '🎸', '🎧'][idx % 3]}
                  </span>
                )}
                {artist.setTime && (
                  <span className="absolute top-3 right-3 text-[0.65rem] font-bold bg-black/60 backdrop-blur-md text-amber-300 px-3 py-1 rounded-full border border-white/20">
                    ⏰ {artist.setTime}
                  </span>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white mb-1">
                    {artist.name}
                  </h3>
                  <p className="text-xs font-semibold text-purple-300 mb-3 uppercase tracking-wider">
                    {artist.genre}
                  </p>
                  <p className="text-xs text-white/75 leading-relaxed">
                    {artist.description}
                  </p>
                </div>
                {artist.instagramHandle && (
                  <span className="text-[0.7rem] text-amber-300 font-bold mt-4 block">
                    📸 {artist.instagramHandle}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


// ── LOCATION SECTION ─────────────────────────────────────────
function LocationSection() {
  const { data } = useWedding()
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleCopyAddress = (address: string, idx: number) => {
    navigator.clipboard?.writeText(address)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2500)
  }

  const venues = [
    {
      title: 'Ceremonia Religiosa',
      subtitle: 'El Sagrado Sacramento',
      venue: data.ceremonyVenue,
      time: data.ceremonyTime,
      address: data.ceremonyAddress,
      mapUrl: data.googleMapsUrl,
      wazeUrl: data.wazeUrl,
      icon: '⛪',
      badge: 'Misa Solemne de Boda',
      gradient: 'from-amber-400/20 via-purple-500/10 to-pink-500/20',
      borderGlow: 'hover:border-amber-400/60',
    },
    {
      title: 'Ceremonia Civil & Recepción',
      subtitle: 'Celebración & Brindis de Gala',
      venue: data.receptionVenue,
      time: `${data.civilTime || '12:00 m.'} (Civil) · ${data.receptionTime} (Recepción)`,
      address: data.receptionAddress,
      mapUrl: data.googleMapsReceptionUrl,
      wazeUrl: data.wazeUrl,
      icon: '🥂',
      badge: 'Recepción & Fiesta de Gala',
      gradient: 'from-pink-400/20 via-purple-500/10 to-amber-500/20',
      borderGlow: 'hover:border-pink-400/60',
    },
  ]

  return (
    <section
      id="lugar"
      className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fbf8ff] via-[#f7f0fc] to-[#fffdfa] relative overflow-hidden"
    >
      {/* GLOW DECORATIVO DE FONDO */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-purple-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-200/40 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/70 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-[0.25em] mb-3">
            <span>📍</span>
            <span>Ubicaciones Oficiales</span>
            <span>✨</span>
          </div>

          <h2 className="section-title reveal">
            ¿Dónde <em>Celebramos</em>?
          </h2>

          <p className="section-subtitle mt-3 reveal max-w-2xl mx-auto text-stone-600">
            Hemos preparado todo con inmenso amor para que nos acompañes en los dos momentos más trascendentales de nuestra unión
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {venues.map((v, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-7 sm:p-9 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/80 bg-white/90 backdrop-blur-md flex flex-col justify-between group ${v.borderGlow}`}
            >
              {/* DECORATIVE LIGHT PILL */}
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${v.gradient} rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-100 via-pink-50 to-amber-50 border border-purple-200/70 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                    {v.icon}
                  </div>
                  <span className="text-[0.68rem] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-100/80 px-3.5 py-1.5 rounded-full border border-purple-200 shadow-xs">
                    {v.badge}
                  </span>
                </div>

                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                  {v.subtitle}
                </span>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 mb-2">
                  {v.venue}
                </h3>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold mb-3 border border-purple-100">
                  <span>⏰</span>
                  <span>{v.time}</span>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6 font-medium">
                  {v.address}
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-purple-50">
                <div className="flex gap-2.5 flex-wrap">
                  <a
                    href={v.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold text-xs py-3 px-5 flex-1 justify-center shadow-md shadow-amber-300/30 font-bold active:scale-95 transition-transform"
                  >
                    <span>📍 Abrir en Google Maps</span>
                    <span>↗</span>
                  </a>

                  {v.wazeUrl && (
                    <a
                      href={v.wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                    >
                      <span>🚗 Waze</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyAddress(v.address, i)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-800 text-[0.72rem] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{copiedIdx === i ? '✅' : '📋'}</span>
                  <span>{copiedIdx === i ? '¡Dirección copiada al portapapeles!' : 'Copiar dirección para taxi o GPS'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── GIFTS / LLUVIA DE SOBRES ─────────────────────────────────
function GiftsSection() {
  const { data } = useWedding()
  return (
    <section
      id="regalos"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50/50 via-white to-amber-50/50"
    >
      <div className="max-w-4xl mx-auto text-center">
        <p className="section-eyebrow mb-2 reveal" style={{ color: '#8b5cf6' }}>
          🎁 Lluvia de Sobres 🎁
        </p>
        <h2 className="section-title reveal">
          Tu Regalo es <em>Bienvenido</em>
        </h2>
        <p className="section-subtitle mt-3 mb-12 reveal">
          El mayor regalo es compartir este día con nuestra amada familia y amigos. Si deseas obsequiarnos algo, aquí tienes nuestros métodos:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 reveal">
          {/* YAPE */}
          <div className="gradient-card rounded-3xl p-6 shadow-md border border-purple-200 flex flex-col items-center">
            <span className="text-4xl mb-3">💜</span>
            <h4 className="font-display text-xl font-bold text-stone-800">Yape</h4>
            <p className="font-bold text-sm text-purple-700 mt-1 mb-3">
              {data.yapePhone}
            </p>
            {data.yapeQrUrl ? (
              <img
                src={data.yapeQrUrl}
                alt="QR Yape"
                className="w-28 h-28 object-contain rounded-xl border border-stone-200 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl">
                📱
              </div>
            )}
            <span className="text-[0.68rem] text-stone-500 mt-3">A nombre de los novios</span>
          </div>

          {/* PLIN */}
          <div className="gradient-card rounded-3xl p-6 shadow-md border border-blue-200 flex flex-col items-center">
            <span className="text-4xl mb-3">💙</span>
            <h4 className="font-display text-xl font-bold text-stone-800">Plin</h4>
            <p className="font-bold text-sm text-blue-700 mt-1 mb-3">
              {data.plinPhone}
            </p>
            <div className="w-24 h-24 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl">
              📲
            </div>
            <span className="text-[0.68rem] text-stone-500 mt-3">Transferencia directa</span>
          </div>

          {/* BANCO */}
          <div className="gradient-card rounded-3xl p-6 shadow-md border border-amber-200 flex flex-col items-center">
            <span className="text-4xl mb-3">🏦</span>
            <h4 className="font-display text-xl font-bold text-stone-800">{data.bankName}</h4>
            <p className="font-bold text-xs text-amber-700 mt-1 mb-2">
              {data.bankAccount}
            </p>
            <div className="w-24 h-24 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl">
              💳
            </div>
            <span className="text-[0.68rem] text-stone-500 mt-3">
              Titular: {data.bankHolder}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── RSVP SECTION ─────────────────────────────────────────────
function RsvpSection() {
  const { data, setData } = useWedding()
  return (
    <RsvpFormSection
      data={data}
      onRsvpAdded={(guest) => {
        setData({
          ...data,
          rsvpList: [guest, ...(data.rsvpList || [])],
        })
      }}
    />
  )
}

// ── FOOTER ───────────────────────────────────────────────────
function Footer() {
  const { data } = useWedding()
  return (
    <footer className="py-16 px-4 text-center bg-[#14081c] text-white">
      <span
        className="font-script block"
        style={{
          fontSize: 'clamp(3rem, 7vw, 4.5rem)',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #a855f7 0%, #fae8c8 50%, #d97706 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {data.groomName} &amp; {data.brideName}
      </span>
      <p className="font-bold tracking-[0.25em] text-purple-400 text-xs sm:text-sm mt-2 mb-4">
        {data.hashtag}
      </p>
      <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
        Con la bendición de Dios, nuestros padres y nuestra amada hija Emma Antonela &bull; 24 de Octubre de 2026
      </p>
    </footer>
  )
}

// ══════════════════════════════════════════════════════════════
//  ROOT COMPONENT
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [data, setData] = useState<WeddingData>(() => loadWeddingData())
  const [adminOpen, setAdminOpen] = useState(false)
  const [petalsEnabled, setPetalsEnabled] = useState(true)

  // Cargar datos completos y frescos desde IndexedDB y Cloud (evita pérdidas por límite de localStorage)
  useEffect(() => {
    let isMounted = true
    loadWeddingDataAsync().then(freshData => {
      if (isMounted && freshData) {
        setData(freshData)
      }
    }).catch(err => {
      console.warn("Aviso: No se pudo cargar datos asíncronos de boda", err)
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Universal music state with intelligent video ducking
  const { playing, toggle: toggleMusic, isMuted, toggleMute, needsGesture, pauseForVideo, resumeFromVideo } = useMusic(data.musicUrl)

  useScrollReveal()

  const handleSaveData = (newData: WeddingData) => {
    setData(newData)
    saveWeddingData(newData)
  }

  const handleAddGuestbookMessage = async (
    msg: Omit<GuestbookMessage, 'id' | 'timestamp' | 'likes'>
  ) => {
    // 1. Guardar directamente en la base de datos MySQL vía Backend
    const backendRes = await submitGuestbookMessageToBackend(msg)
    const newMessage: GuestbookMessage = backendRes.success && backendRes.data
      ? backendRes.data
      : {
          ...msg,
          id: `gb-${Date.now()}`,
          timestamp: 'Justo ahora',
          likes: 1,
          isPinned: false,
        }
    const updated = { ...data, guestbook: [newMessage, ...data.guestbook] }
    handleSaveData(updated)
  }

  const handleLikeMessage = (id: string) => {
    likeGuestbookMessageInBackend(id).catch(() => {})
    const updated = {
      ...data,
      guestbook: data.guestbook.map(m =>
        m.id === id ? { ...m, likes: m.likes + 1 } : m
      ),
    }
    handleSaveData(updated)
  }

  const handleDeleteGuestbookMessage = (id: string) => {
    deleteGuestbookMessageFromBackend(id).catch(() => {})
    const updated = {
      ...data,
      guestbook: data.guestbook.filter(m => m.id !== id),
    }
    handleSaveData(updated)
  }

  const handleTogglePinMessage = (id: string) => {
    const updated = {
      ...data,
      guestbook: data.guestbook.map(m =>
        m.id === id ? { ...m, isPinned: !m.isPinned } : m
      ),
    }
    handleSaveData(updated)
  }

  return (
    <WeddingCtx.Provider value={{ data, setData: handleSaveData }}>
      {/* FLOATING PETALS */}
      <FloatingPetals enabled={petalsEnabled} />

      {/* UNIFIED FIXED HEADER WITH ANNOUNCEMENT AND INTERACTIVE SLIDING NAV */}
      <header className="fixed top-0 left-0 right-0 z-[1000] flex flex-col shadow-xs">
        <AnnouncementBanner announcement={data.announcement} />
        <InteractiveNav
          data={data}
          onOpenAdmin={() => setAdminOpen(true)}
          petalsEnabled={petalsEnabled}
          onTogglePetals={() => setPetalsEnabled(!petalsEnabled)}
          playing={playing}
          onToggleMusic={toggleMusic}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          needsGesture={needsGesture}
        />
      </header>

      {/* FLOATING PROMPT IF BROWSER RESTRICTED INITIAL UNMUTED AUTOPLAY */}
      {needsGesture && !playing && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-6 left-6 z-[9995] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white text-xs font-bold shadow-2xl hover:scale-105 transition-all cursor-pointer animate-pulse"
        >
          <span className="text-base">🎵</span>
          <span>Toca para activar música &ldquo;A Thousand Years&rdquo;</span>
        </button>
      )}

      {/* MAIN CONTENT */}
      <main className="w-full overflow-hidden">
        <HeroSection />

        {/* REPRODUCCIÓN DIGITAL DE LA INVITACIÓN OFICIAL (PADRES, HIJA, CEREMONIAS) */}
        <InvitationCardSection data={data} />

        {/* INTERACTIVE STORIES REEL */}
        <StoriesBar stories={data.stories} />

        <CountdownSection />
        <LoveStorySection />
        <GalleryCollage photos={data.galleryPhotos} />
        <VideoCinema
          videos={data.videos}
          defaultVideoId={data.youtubeVideoId}
          defaultTitle={data.videoTitle}
          onVideoPlay={pauseForVideo}
          onVideoPause={resumeFromVideo}
        />
        <ArtistsSection />
        <DidacticScheduleSection schedule={data.schedule} wedding={data} />
        <LocationSection />
        <DressCodeGuide
          dressCode={data.dressCode}
          palette={data.dressPalette}
          specialNote={data.specialNote}
        />
        <GiftsSection />
        <GuestbookSection
          messages={data.guestbook}
          onAddMessage={handleAddGuestbookMessage}
          onLikeMessage={handleLikeMessage}
        />
        <FaqSection />
        <RsvpSection />
      </main>

      <Footer />

      {/* MODERN ADMIN PORTAL */}
      <AdminPortal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        data={data}
        onSaveData={handleSaveData}
        onDeleteGuestbookMessage={handleDeleteGuestbookMessage}
        onTogglePinMessage={handleTogglePinMessage}
      />

      {/* LIVE BACKEND & MYSQL STATUS BADGE */}
      <BackendStatusBadge
        onSyncRequested={() => {
          loadWeddingDataAsync().then(fresh => {
            if (fresh) setData(fresh)
          })
        }}
      />

      {/* LIVE WEDDING CHAT WIDGET */}
      <WeddingLiveChat
        messages={data.guestbook}
        onSendMessage={handleAddGuestbookMessage}
        onLikeMessage={handleLikeMessage}
      />
    </WeddingCtx.Provider>
  )
}
