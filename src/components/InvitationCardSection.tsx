import type { WeddingData } from '../types/wedding'

interface InvitationCardSectionProps {
  data: WeddingData
}

export function InvitationCardSection({ data }: InvitationCardSectionProps) {
  return (
    <section
      id="invitacion-oficial"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-[#fffdfa] via-[#f7f2fc] to-[#fffdfa]"
    >
      {/* DECORATIVE CORNER BLURS */}
      <div className="absolute -top-12 -left-12 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="section-eyebrow mb-2 reveal" style={{ color: '#8b5cf6' }}>
            💌 Participación Oficial de Boda 💌
          </p>
          <h2 className="section-title reveal">
            Nuestra Sagrada <em>Invitación</em>
          </h2>
          <p className="section-subtitle mt-3 reveal">
            Con la bendición de Dios, de nuestros queridos padres y de nuestra adorada hija Emma Antonela
          </p>
        </div>

        {/* REPRODUCCIÓN DIGITAL DE LA TARJETA DE BODA (ESTILO LILAC & GOLD LUXURY) */}
        <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl sm:rounded-[36px] p-6 sm:p-12 lg:p-16 shadow-2xl border-2 border-[#e6d7ff] reveal overflow-hidden">
          {/* GEOMETRIC GOLD CORNERS */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-amber-400/80 rounded-tl-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-amber-400/80 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-amber-400/80 rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-400/80 rounded-br-3xl pointer-events-none" />

          {/* WATERMARK FLOWERS */}
          <div className="absolute -top-6 -left-6 text-7xl opacity-20 pointer-events-none select-none">🪻</div>
          <div className="absolute -top-6 -right-6 text-7xl opacity-20 pointer-events-none select-none">🪻</div>
          <div className="absolute -bottom-6 -left-6 text-7xl opacity-20 pointer-events-none select-none">🪻</div>
          <div className="absolute -bottom-6 -right-6 text-7xl opacity-20 pointer-events-none select-none">🪻</div>

          <div className="text-center max-w-3xl mx-auto space-y-7">
            {/* SPIRITUAL BLESSING QUOTE */}
            <p className="font-display italic text-stone-700 text-sm sm:text-base lg:text-lg leading-relaxed px-4">
              &ldquo;{data.spiritualBlessing || "Con la bendición de Dios y de nuestros padres. Queremos que estés presente en este día donde complementaremos nuestro amor con un Sí para toda la vida."}&rdquo;
            </p>

            {/* COUPLE NAMES */}
            <div className="py-2">
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="text-2xl animate-pulse">💍</span>
                <h3
                  className="font-script text-4xl sm:text-6xl lg:text-7xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d97706 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {data.groomName} &amp; {data.brideName}
                </h3>
                <span className="text-2xl animate-pulse">💍</span>
              </div>
              <p className="text-xs uppercase tracking-[0.25em] font-extrabold text-stone-500 mt-1">
                {data.groomFullName} &bull; {data.brideFullName}
              </p>
            </div>

            {/* PARENTS & DAUGHTER */}
            <div className="py-4 border-y border-purple-100/90 space-y-4">
              <p className="text-xs uppercase font-extrabold tracking-widest text-purple-700">
                Con la bendición de Dios, de nuestros padres y nuestra hija
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {/* PADRES DEL NOVIO */}
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <span className="text-[0.68rem] font-bold text-purple-600 uppercase tracking-wider block mb-1">
                    Padres del Novio
                  </span>
                  <p className="font-display text-base font-bold text-stone-800">
                    {data.groomFather || "Jorge Quispe Quispe"}
                  </p>
                  <p className="font-display text-base font-bold text-stone-800">
                    {data.groomMother || "Barbara Pillco Ramos"}
                  </p>
                </div>

                {/* PADRES DE LA NOVIA */}
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <span className="text-[0.68rem] font-bold text-purple-600 uppercase tracking-wider block mb-1">
                    Padres de la Novia
                  </span>
                  <p className="font-display text-base font-bold text-stone-800">
                    {data.brideFather || "Ricardo Choque Carzorla"}
                  </p>
                  <p className="font-display text-base font-bold text-stone-800">
                    {data.brideMother || "Juliana Baez Baez"}
                  </p>
                </div>
              </div>

              {/* HIJA */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 inline-block w-full max-w-md mx-auto">
                <span className="text-[0.68rem] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Nuestra Amada Hija
                </span>
                <p className="font-display text-lg font-bold text-stone-900">
                  💖 {data.daughterName || "Emma Antonela Quispe Choque"} 💖
                </p>
              </div>

              <div className="pt-2">
                <p className="text-xs sm:text-sm font-semibold text-stone-600 uppercase tracking-widest">
                  Te invitamos a nuestro Matrimonio Religioso y Civil
                </p>
                <p className="font-script text-2xl sm:text-3xl text-purple-800 font-bold mt-1">
                  &iexcl;&iexcl;Nos casamos!!
                </p>
              </div>
            </div>

            {/* TABLE OF CEREMONIES & TIMES (AS SEEN IN INVITATION) */}
            <div className="grid grid-cols-1 md:grid-cols-4 rounded-2xl overflow-hidden border-2 border-purple-200 bg-white shadow-sm divide-y md:divide-y-0 md:divide-x divide-purple-100">
              <div className="p-4 flex flex-col justify-center items-center bg-purple-50/60">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-purple-700">
                  SÁBADO
                </span>
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-stone-800">
                  24
                </span>
                <span className="text-xs font-bold text-purple-900 uppercase">
                  Octubre 2026
                </span>
              </div>

              <div className="p-4 flex flex-col justify-center items-center">
                <span className="text-[0.68rem] font-bold text-stone-400 uppercase tracking-wider">
                  Hora Inicio
                </span>
                <p className="font-display text-2xl sm:text-3xl font-bold text-stone-800 mt-1">
                  8:00 <span className="text-sm font-normal">A.M.</span>
                </p>
                <span className="text-[0.68rem] text-stone-500 font-medium">Puntualidad</span>
              </div>

              <div className="p-4 flex flex-col justify-center items-center text-center">
                <span className="text-[0.68rem] font-bold text-purple-700 uppercase tracking-wider">
                  Ceremonia Religiosa
                </span>
                <p className="font-display text-lg font-bold text-stone-800 mt-1">
                  {data.ceremonyVenue}
                </p>
                <span className="text-[0.68rem] text-stone-500">{data.ceremonyTime}</span>
              </div>

              <div className="p-4 flex flex-col justify-center items-center text-center bg-purple-50/30">
                <span className="text-[0.68rem] font-bold text-purple-700 uppercase tracking-wider">
                  Ceremonia Civil
                </span>
                <p className="font-display text-lg font-bold text-stone-800 mt-1">
                  {data.civilVenue || "Local El Golazo"}
                </p>
                <span className="text-[0.68rem] text-stone-500">{data.civilTime || "12:00 m."}</span>
              </div>
            </div>

            {/* PADRINOS & RECEPCIÓN */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <strong className="block text-purple-800 font-bold uppercase tracking-wider mb-1">
                  Padrinos Mayor:
                </strong>
                <p className="text-stone-700 font-semibold">
                  {data.padrinoMayor || "Jorge Alcca Ramos"} &bull; {data.madrinaMayor || "Maria Pachacutec Baez"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <strong className="block text-purple-800 font-bold uppercase tracking-wider mb-1">
                  Padrinos de Aros:
                </strong>
                <p className="text-stone-700 font-semibold">
                  {data.padrinoAros || "Percy Pachacutec Baez"} &bull; {data.madrinaAros || "Herlinda Baez Tacuri"}
                </p>
              </div>
            </div>

            {/* VENUE BANNER */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-100 via-amber-100 to-purple-100 border border-purple-200 text-stone-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <span>📍</span>
              <span>Recepción General: {data.receptionVenue}, {data.receptionAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
