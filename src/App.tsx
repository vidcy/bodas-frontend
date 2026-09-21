import { useState, createContext, useContext } from 'react'
import './index.css'
import {
  DEFAULT_WEDDING,
  loadWeddingData,
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
        className="absolute inset-0 bg-cover bg-center animate-hero-zoom opacity-35"
        style={{
          backgroundImage: `url(${data.heroBannerUrl || data.mainCouplePhoto})`,
          objectPosition: data.heroPhotoPosition || 'center 30%',
        }}
      />

      {/* RADIANT AMBIENT GRADIENT */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 75% 40%, rgba(217, 119, 6, 0.45) 0%, transparent 60%), linear-gradient(135deg, rgba(30, 10, 50, 0.94) 0%, rgba(65, 20, 95, 0.88) 50%, rgba(20, 8, 35, 0.95) 100%)',
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
                <img
                  src={data.mainCouplePhoto}
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

// ── SCHEDULE SECTION ─────────────────────────────────────────
function ScheduleSection() {
  const { data } = useWedding()
  return (
    <section id="programa" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-2 reveal" style={{ color: '#8b5cf6' }}>
            🗓️ Itinerario Oficial del Sábado 24 de Octubre 🗓️
          </p>
          <h2 className="section-title reveal">
            Programa del <em>Gran Día</em>
          </h2>
          <p className="section-subtitle mt-3 reveal">
            Desde la misa solemne en la Iglesia Señor Qoyllority hasta la fiesta bailable en el Local El Golazo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 reveal">
          {data.schedule.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-stone-50/80 border border-purple-100 flex items-center gap-4 hover:bg-purple-50/40 hover:scale-[1.02] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[0.68rem] font-extrabold text-purple-700 tracking-wider uppercase block">
                  {item.time}
                </span>
                <h4 className="font-display text-base font-bold text-stone-900 truncate">
                  {item.event}
                </h4>
                {item.detail && (
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    {item.detail}
                  </p>
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
  const venues = [
    {
      title: 'Ceremonia Religiosa',
      venue: data.ceremonyVenue,
      time: data.ceremonyTime,
      address: data.ceremonyAddress,
      mapUrl: data.googleMapsUrl,
      wazeUrl: data.wazeUrl,
      icon: '⛪',
      badge: 'Misa Solemne',
    },
    {
      title: 'Ceremonia Civil & Recepción',
      venue: data.receptionVenue,
      time: `${data.civilTime || '12:00 m.'} (Civil) / ${data.receptionTime} (Fiesta)`,
      address: data.receptionAddress,
      mapUrl: data.googleMapsReceptionUrl,
      wazeUrl: data.wazeUrl,
      icon: '🥂',
      badge: 'Recepción & Fiesta',
    },
  ]

  return (
    <section
      id="lugar"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f7f2fc]/50 to-[#fffdfa]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-2 reveal" style={{ color: '#8b5cf6' }}>
            📍 Lugares del Evento 📍
          </p>
          <h2 className="section-title reveal">
            ¿Dónde <em>Celebramos</em>?
          </h2>
          <p className="section-subtitle mt-3 reveal">
            Te esperamos con los brazos abiertos para compartir este hermoso día
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {venues.map((v, i) => (
            <div
              key={i}
              className="gradient-card rounded-3xl p-8 shadow-lg border border-purple-100 flex flex-col justify-between reveal"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl mb-4">
                  {v.icon}
                </div>
                <span className="text-[0.68rem] font-bold uppercase tracking-widest text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full">
                  {v.badge}
                </span>
                <h3 className="font-display text-2xl font-bold text-stone-800 mt-3 mb-2">
                  {v.venue}
                </h3>
                <p className="text-xs font-bold text-purple-600 mb-2">
                  ⏰ {v.time}
                </p>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                  {v.address}
                </p>
              </div>

              <div className="flex gap-2.5 flex-wrap">
                <a
                  href={v.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-xs py-2.5 px-4 flex-1 justify-center"
                >
                  📍 Ver en Google Maps
                </a>
                {v.wazeUrl && (
                  <a
                    href={v.wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold btn-white text-xs py-2.5 px-4 justify-center"
                  >
                    🚗 Waze
                  </a>
                )}
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
  const { data } = useWedding()
  const whatsappUrl = `https://wa.me/${data.rsvpPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    data.rsvpWhatsappMessage
  )}`

  return (
    <section
      id="rsvp"
      className="relative py-28 px-4 sm:px-6 lg:px-8 text-center text-white overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)',
      }}
    >
      <StarsBackground count={50} />

      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="section-eyebrow mb-2 reveal" style={{ color: '#fae8c8' }}>
          💌 Tu Presencia es Nuestro Mayor Regalo 💌
        </p>
        <h2 className="section-title reveal" style={{ color: '#ffffff' }}>
          ¡Confirma tu <em>Asistencia</em>!
        </h2>
        <p className="section-subtitle mt-3 mb-10 reveal" style={{ color: 'rgba(255,255,255,0.88)' }}>
          Por favor confirma tu presencia antes del <strong>{data.rsvpDeadline}</strong> para disponer de tus lugares en la mesa de gala.
        </p>

        <div className="glass-panel-dark rounded-3xl p-8 border border-white/25 shadow-2xl reveal">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 mb-6 text-left">
            <span className="text-3xl">📅</span>
            <div>
              <strong className="block text-white text-sm">Fecha Límite de Confirmación</strong>
              <span className="text-xs text-white/80">{data.rsvpDeadline}</span>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-full font-bold text-sm sm:text-base uppercase tracking-wider text-white shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95"
            style={{
              background: '#25D366',
              boxShadow: '0 8px 30px rgba(37, 211, 102, 0.45)',
            }}
          >
            <span className="text-2xl">💬</span>
            <span>Confirmar por WhatsApp</span>
          </a>

          <p className="text-xs text-white/70 mt-4">
            También puedes comunicarte directamente al {data.rsvpPhone}
          </p>
        </div>
      </div>
    </section>
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

  // Universal music state
  const { playing, toggle: toggleMusic, isMuted, toggleMute, needsGesture } = useMusic(data.musicUrl)

  useScrollReveal()

  const handleSaveData = (newData: WeddingData) => {
    setData(newData)
    saveWeddingData(newData)
  }

  const handleAddGuestbookMessage = (
    msg: Omit<GuestbookMessage, 'id' | 'timestamp' | 'likes'>
  ) => {
    const newMessage: GuestbookMessage = {
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
    const updated = {
      ...data,
      guestbook: data.guestbook.map(m =>
        m.id === id ? { ...m, likes: m.likes + 1 } : m
      ),
    }
    handleSaveData(updated)
  }

  const handleDeleteGuestbookMessage = (id: string) => {
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
        />
        <ArtistsSection />
        <ScheduleSection />
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
    </WeddingCtx.Provider>
  )
}
