interface DressCodeGuideProps {
  dressCode: string
  palette: string[]
  specialNote: string
}

export function DressCodeGuide({ dressCode, palette, specialNote }: DressCodeGuideProps) {
  return (
    <section id="dresscode" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fffdfa] to-[#fff0f5] overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-eyebrow mb-2 reveal">👗 Código de Vestimenta 👔</p>
          <h2 className="section-title reveal">
            Dress Code & <em>Estilo</em>
          </h2>
          <p className="section-subtitle mt-3 reveal">
            Queremos que te sientas espectacular y disfrutes al máximo de esta gran celebración
          </p>
        </div>

        {/* MAIN DRESS CODE BADGE */}
        <div className="text-center mb-12 reveal">
          <div className="inline-block p-1 rounded-3xl bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 shadow-xl">
            <div className="bg-white px-8 py-5 rounded-[22px]">
              <span className="text-xs uppercase font-extrabold tracking-widest text-pink-600 block mb-1">
                Etiqueta Solicitada
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-800">
                {dressCode}
              </h3>
            </div>
          </div>
        </div>

        {/* 2-COLUMN GUIDE (DAMAS & CABALLEROS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* DAMAS */}
          <div className="glass-panel p-8 rounded-3xl shadow-sm border border-pink-100 hover:shadow-md transition-all reveal">
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-pink-100">
              <span className="text-3xl p-3 bg-pink-50 rounded-2xl">💃</span>
              <div>
                <h4 className="font-display text-xl font-bold text-stone-800">Para Damas</h4>
                <p className="text-xs text-pink-600 font-semibold">Elegancia & Distinción</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-stone-600">
              <li className="flex items-center gap-2.5">
                <span className="text-pink-500 font-bold">✓</span>
                <span>Vestido largo de gala o midi formal.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-pink-500 font-bold">✓</span>
                <span>Colores sugeridos: tonos pastel, rosados, lavanda, dorados.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-pink-500 font-bold">✓</span>
                <span>Calzado cómodo para bailar durante toda la fiesta.</span>
              </li>
            </ul>
          </div>

          {/* CABALLEROS */}
          <div className="glass-panel p-8 rounded-3xl shadow-sm border border-pink-100 hover:shadow-md transition-all reveal">
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-pink-100">
              <span className="text-3xl p-3 bg-amber-50 rounded-2xl">🤵</span>
              <div>
                <h4 className="font-display text-xl font-bold text-stone-800">Para Caballeros</h4>
                <p className="text-xs text-amber-700 font-semibold">Sobriedad & Porte</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-stone-600">
              <li className="flex items-center gap-2.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Terno oscuro (azul marino, negro o gris oxford) o smoking.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Camisa blanca formal con corbata o humita.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Zapatos formales de cuero lustrado.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* PALETTE & SPECIAL NOTE */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-amber-50 via-white to-pink-50 border border-pink-200/80 shadow-lg text-center reveal">
          <h4 className="font-display text-lg font-bold text-stone-800 mb-2">
            Paleta de Colores Inspiración
          </h4>
          <p className="text-xs text-stone-500 mb-6">
            Gamas armónicas pensadas para lucir en las fotos oficiales del evento
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
            {palette.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 group">
                <div
                  className="w-12 h-12 rounded-2xl shadow-md border-2 border-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[0.65rem] font-bold text-stone-500 uppercase tracking-wider">
                  {color}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-pink-100/60 border border-pink-300 text-stone-800 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mx-auto flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <span>{specialNote}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
