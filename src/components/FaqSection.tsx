import { useState } from 'react'

interface FaqItem {
  q: string
  a: string
  icon: string
}

const FAQS: FaqItem[] = [
  {
    q: '¿Hay estacionamiento disponible?',
    a: 'Sí, tanto la Iglesia San Francisco como el Club Social El Olivar cuentan con servicio de estacionamiento privado y personal de seguridad para su total tranquilidad.',
    icon: '🚗'
  },
  {
    q: '¿Habrá transporte entre la iglesia y la recepción?',
    a: '¡Por supuesto! Habrá un bus turístico exclusivo contratado para trasladar a los invitados desde el Centro de Lima hacia San Isidro al terminar la sesión de fotos.',
    icon: '🚌'
  },
  {
    q: '¿Hasta qué fecha puedo confirmar mi asistencia?',
    a: 'Te rogamos confirmar tu asistencia a través del botón de WhatsApp en la sección RSVP a más tardar el 30 de noviembre para poder coordinar los cubiertos y mesas.',
    icon: '📅'
  },
  {
    q: '¿Es un evento apto para niños?',
    a: 'Deseamos que todos los papás disfruten y bailen al máximo sin preocupaciones, por lo que hemos preparado una noche pensada exclusivamente para adultos.',
    icon: '🥂'
  },
  {
    q: '¿Qué opciones de menú habrá para dietas especiales?',
    a: 'Contaremos con opciones vegetarianas y libres de gluten. Si tienes alguna restricción médica, por favor háznoslo saber en tu mensaje de confirmación.',
    icon: '🍽️'
  }
]

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-eyebrow mb-2 reveal">❓ Preguntas Frecuentes ❓</p>
          <h2 className="section-title reveal">
            Todo lo que <em>necesitas saber</em>
          </h2>
          <p className="section-subtitle mt-3 reveal">
            Resolvemos tus dudas para que vivas una experiencia fluida e inolvidable
          </p>
        </div>

        <div className="space-y-4 reveal">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div
                key={i}
                className="rounded-2xl border border-pink-100 overflow-hidden transition-all duration-300 bg-stone-50/50 hover:bg-stone-50"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{faq.icon}</span>
                    <h3 className="font-display text-lg font-bold text-stone-800">
                      {faq.q}
                    </h3>
                  </div>
                  <span
                    className={`w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-bold text-pink-600 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 bg-pink-100' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-stone-600 leading-relaxed border-t border-pink-50">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
