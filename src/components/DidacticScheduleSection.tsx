import { useState } from 'react'
import type { ScheduleItem, WeddingData } from '../types/wedding'

interface DidacticScheduleSectionProps {
  schedule: ScheduleItem[]
  wedding: WeddingData
}

export function DidacticScheduleSection({ schedule, wedding }: DidacticScheduleSectionProps) {
  const [filter, setFilter] = useState<'all' | 'ceremony' | 'reception' | 'party'>('all')
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const categorizedItems = schedule.map((item, idx) => {
    let category: 'ceremony' | 'reception' | 'party' = 'ceremony'
    let venue = wedding.ceremonyVenue
    let mapUrl = wedding.googleMapsUrl
    let tip = 'Llegar 15 minutos antes para ubicarse en los bancos de gala.'

    const timeUpper = item.time.toUpperCase()
    if (timeUpper.includes('7:30') || timeUpper.includes('8:00') || timeUpper.includes('9:30')) {
      category = 'ceremony'
      venue = wedding.ceremonyVenue
      mapUrl = wedding.googleMapsUrl
      tip = 'Misa solemne en Parroquia San Vicente de Paúl (Señor de Qoyllority).'
    } else if (timeUpper.includes('11:30') || timeUpper.includes('12:00') || timeUpper.includes('1:00')) {
      category = 'reception'
      venue = wedding.receptionVenue
      mapUrl = wedding.googleMapsReceptionUrl
      tip = 'Traslado y recepción en Local El Golazo (Av. Aeropuerto).'
    } else {
      category = 'party'
      venue = wedding.receptionVenue
      mapUrl = wedding.googleMapsReceptionUrl
      tip = 'Música en vivo con orquesta y mariachi para bailar toda la noche.'
    }

    return {
      ...item,
      originalIndex: idx,
      category,
      venue,
      mapUrl,
      tip,
    }
  })

  const filteredItems = categorizedItems.filter((it) => {
    if (filter === 'all') return true
    return it.category === filter
  })

  return (
    <section
      id="programa"
      className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#faf5ff] to-white relative overflow-hidden"
    >
      {/* GLOW DECORATIONS */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-purple-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-100/60 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-bold uppercase tracking-[0.25em] mb-4 shadow-sm">
            <span>🗓️</span>
            <span>Itinerario Oficial &bull; Sábado 24 de Octubre de 2026</span>
            <span>✨</span>
          </div>

          <h2 className="section-title reveal">
            Programa del <em>Gran Día</em>
          </h2>

          <p className="section-subtitle mt-3 reveal max-w-2xl mx-auto text-stone-600">
            Hemos organizado cada detalle con mucho cariño para que vivas una experiencia inolvidable desde la misa en la <strong>Parroquia San Vicente de Paúl</strong> hasta la fiesta de gala en el <strong>Local &ldquo;El Golazo&rdquo;</strong>.
          </p>

          {/* DIDACTIC CATEGORY FILTER PILLS */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 reveal">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-600/25 scale-105'
                  : 'bg-white text-stone-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              ✨ Todos los Momentos ({schedule.length})
            </button>

            <button
              onClick={() => setFilter('ceremony')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'ceremony'
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-600/25 scale-105'
                  : 'bg-white text-stone-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              ⛪ Iglesia &amp; Ceremonia Religiosa
            </button>

            <button
              onClick={() => setFilter('reception')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'reception'
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-600/25 scale-105'
                  : 'bg-white text-stone-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              📜 Matrimonio Civil &amp; Brindis
            </button>

            <button
              onClick={() => setFilter('party')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'party'
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-600/25 scale-105'
                  : 'bg-white text-stone-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              💃 Fiesta, Vals &amp; Orquesta
            </button>
          </div>
        </div>

        {/* INTERACTIVE TIMELINE */}
        <div className="relative">
          {/* VERTICAL TIMELINE LINE */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-1 bg-gradient-to-b from-purple-300 via-amber-400 to-purple-400 rounded-full" />

          <div className="space-y-6 md:space-y-10">
            {filteredItems.map((item, idx) => {
              const isEven = idx % 2 === 0
              const isSelected = activeStep === item.originalIndex

              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(isSelected ? null : item.originalIndex)}
                  className={`relative flex flex-col md:flex-row items-center gap-6 group cursor-pointer transition-all duration-300 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* CONTENT CARD */}
                  <div className="w-full md:w-[calc(50%-2.5rem)]">
                    <div
                      className={`rounded-3xl p-6 sm:p-7 transition-all duration-300 border shadow-lg ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-900 to-[#2c0e3a] text-white border-amber-400 shadow-2xl scale-[1.02]'
                          : 'bg-white/90 backdrop-blur-md text-stone-900 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-2 rounded-2xl bg-amber-400/15 border border-amber-300/30">
                            {item.icon}
                          </span>
                          <div>
                            <span
                              className={`text-[0.68rem] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                isSelected
                                  ? 'bg-amber-400 text-black'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              Paso {String(item.originalIndex + 1).padStart(2, '0')}
                            </span>
                            <span
                              className={`block font-bold text-xs mt-1 ${
                                isSelected ? 'text-amber-200' : 'text-purple-700'
                              }`}
                            >
                              ⏰ {item.time}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                            isSelected
                              ? 'bg-white/10 text-white/90 border-white/20'
                              : 'bg-stone-100 text-stone-600 border-stone-200'
                          }`}
                        >
                          {item.category === 'ceremony'
                            ? '⛪ Parroquia'
                            : item.category === 'reception'
                            ? '📜 Protocolo'
                            : '💃 Fiesta'}
                        </span>
                      </div>

                      <h3
                        className={`font-display text-lg sm:text-xl font-bold leading-snug ${
                          isSelected ? 'text-white' : 'text-stone-900'
                        }`}
                      >
                        {item.event}
                      </h3>

                      {item.detail && (
                        <p
                          className={`text-xs mt-2 leading-relaxed ${
                            isSelected ? 'text-white/80' : 'text-stone-600'
                          }`}
                        >
                          {item.detail}
                        </p>
                      )}

                      {/* EXTRA DIDACTIC TIP & MAP SHORTCUT */}
                      <div
                        className={`mt-4 pt-3.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                          isSelected ? 'border-white/15' : 'border-stone-100'
                        }`}
                      >
                        <span
                          className={`text-[11px] font-medium flex items-center gap-1.5 ${
                            isSelected ? 'text-amber-300' : 'text-purple-900'
                          }`}
                        >
                          <span>📍</span>
                          <span>{item.venue}</span>
                        </span>

                        <a
                          href={item.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                            isSelected
                              ? 'bg-amber-400 text-black hover:bg-amber-300'
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          }`}
                        >
                          <span>Ver Mapa</span>
                          <span>↗</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* CENTER STEP BADGE (DESKTOP) */}
                  <div className="hidden md:flex w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-purple-600 to-pink-500 border-4 border-white shadow-xl items-center justify-center text-white font-black text-xs z-20 group-hover:scale-125 transition-transform duration-300">
                    {item.originalIndex + 1}
                  </div>

                  {/* SPACER FOR TWO COLUMN LAYOUT */}
                  <div className="hidden md:block w-[calc(50%-2.5rem)]" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
