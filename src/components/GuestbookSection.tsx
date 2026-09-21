import { useState, useMemo } from 'react'
import type { GuestbookMessage } from '../types/wedding'
import { containsProfanity } from '../utils/profanityFilter'

interface GuestbookSectionProps {
  messages: GuestbookMessage[]
  onAddMessage: (msg: Omit<GuestbookMessage, 'id' | 'timestamp' | 'likes'>) => void
  onLikeMessage: (id: string) => void
}

const RELATIONSHIPS = [
  'Familia de la Novia 👰',
  'Familia del Novio 🤵',
  'Amigos de la Infancia 🎈',
  'Amigos de la Universidad 🎓',
  'Compañeros de Trabajo 💼',
  'Padrinos / Testigos 🌟',
  'Amigos de la Pareja 🥂',
]

const EMOJI_STICKERS = ['💐', '💍', '🥂', '✨', '❤️', '🕊️', '🎉', '👰', '💖', '🥰']

export function GuestbookSection({ messages, onAddMessage, onLikeMessage }: GuestbookSectionProps) {
  const [author, setAuthor] = useState('')
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0])
  const [message, setMessage] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_STICKERS[0])
  const [submittedSuccess, setSubmittedSuccess] = useState(false)
  const [filterTag, setFilterTag] = useState<string>('todos')

  // Real-time profanity validation
  const messageProfanity = useMemo(() => containsProfanity(message), [message])
  const authorProfanity = useMemo(() => containsProfanity(author), [author])
  const hasProfanity = messageProfanity.hasProfanity || authorProfanity.hasProfanity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!author.trim() || !message.trim()) return

    // Strict validation
    if (hasProfanity) {
      return
    }

    onAddMessage({
      author: author.trim(),
      relationship,
      message: message.trim(),
      emoji: selectedEmoji,
    })

    setMessage('')
    setAuthor('')
    setSubmittedSuccess(true)
    setTimeout(() => setSubmittedSuccess(false), 4500)
  }

  const filteredMessages = useMemo(() => {
    if (filterTag === 'todos') return messages
    if (filterTag === 'destacados') return messages.filter(m => m.isPinned)
    return messages.filter(m => m.relationship.includes(filterTag))
  }, [messages, filterTag])

  return (
    <section
      id="foro-deseos"
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #fffdfa 0%, #fff0f5 50%, #f9f5ff 100%)' }}
    >
      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-10 left-10 text-[10rem] opacity-[0.03] select-none pointer-events-none">💌</div>
      <div className="absolute bottom-10 right-10 text-[10rem] opacity-[0.03] select-none pointer-events-none">🕊️</div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-14">
          <p className="section-eyebrow mb-2 reveal">🕊️ Espacio de Amor & Buenos Deseos 🕊️</p>
          <h2 className="section-title reveal">
            Libro de Firmas & <em>Bendiciones</em>
          </h2>
          <p className="section-subtitle mt-3 reveal">
            Deja tus palabras de bendición para los novios. Este muro permanecerá como un hermoso recuerdo de su boda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FORMULARIO DE ENVÍO */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-100/80 reveal">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pink-100">
              <span className="text-3xl p-2.5 rounded-2xl bg-pink-50 border border-pink-200">✍️</span>
              <div>
                <h3 className="font-display text-xl font-bold text-stone-800">Escribir Mensaje</h3>
                <p className="text-[0.72rem] text-stone-500 font-medium">Comparte tus mejores deseos</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NOMBRE */}
              <div>
                <label className="block text-[0.68rem] font-bold tracking-wider uppercase text-stone-600 mb-1">
                  Tu Nombre o Familia <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Ej: Tía Elena y Familia"
                  className={`field-input ${authorProfanity.hasProfanity ? 'border-red-400 bg-red-50 text-red-700' : ''}`}
                  maxLength={60}
                />
              </div>

              {/* RELACIÓN / PARENTESCO */}
              <div>
                <label className="block text-[0.68rem] font-bold tracking-wider uppercase text-stone-600 mb-1">
                  ¿Cómo conoces a los novios?
                </label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="field-input cursor-pointer bg-white"
                >
                  {RELATIONSHIPS.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              {/* STICKER EMOJI */}
              <div>
                <label className="block text-[0.68rem] font-bold tracking-wider uppercase text-stone-600 mb-1.5">
                  Elige tu sello de bendición
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_STICKERS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${selectedEmoji === emoji
                          ? 'bg-pink-100 border-2 border-pink-400 scale-110 shadow-sm'
                          : 'bg-stone-50 hover:bg-pink-50 border border-stone-200'
                        }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* MENSAJE CON FILTRO ESTRICTO */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[0.68rem] font-bold tracking-wider uppercase text-stone-600">
                    Tu Mensaje con Cariño <span className="text-pink-500">*</span>
                  </label>
                  <span className="text-[0.65rem] text-stone-400">{message.length}/350</span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Escribe tus bendiciones, anécdotas o felicitaciones para Wilber y Victoria..."
                  className={`field-input leading-relaxed ${messageProfanity.hasProfanity
                      ? 'border-red-400 bg-red-50/50 shadow-inner'
                      : ''
                    }`}
                  maxLength={350}
                />
              </div>

              {/* ALERTA EN VIVO SI HAY MALAS PALABRAS (BLOQUEO) */}
              {hasProfanity && (
                <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 flex items-start gap-2.5 animate-pulse text-xs leading-relaxed">
                  <span className="text-xl flex-shrink-0">⚠️</span>
                  <div>
                    <strong className="block font-bold">Palabras no permitidas detectadas</strong>
                    <span>
                      Este muro es un espacio de bendición y respeto para la boda. Por favor cambia las palabras ofensivas para poder publicar tu mensaje. 🕊️
                    </span>
                  </div>
                </div>
              )}

              {/* ÉXITO AL PUBLICAR */}
              {submittedSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <span className="text-lg">🎉</span>
                  <span>¡Tu bendición ha sido publicada con éxito en el muro!</span>
                </div>
              )}

              {/* BOTÓN ENVIAR CON ESTADO */}
              <button
                type="submit"
                disabled={hasProfanity || !author.trim() || !message.trim()}
                className={`w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${hasProfanity
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                    : 'btn-gold shadow-lg hover:shadow-pink-300/50'
                  }`}
              >
                {hasProfanity ? (
                  <>
                    <span>🔒</span>
                    <span>Mensaje Bloqueado (Lenguaje no apto)</span>
                  </>
                ) : (
                  <>
                    <span>🕊️</span>
                    <span>Publicar Mi Bendición</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* LISTA DE MENSAJES VIBRANTES */}
          <div className="lg:col-span-7 flex flex-col gap-4 reveal">
            {/* BARRA DE FILTROS & CONTADOR */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-800">
                  {messages.length} {messages.length === 1 ? 'Mensaje de amor' : 'Mensajes de amor'}
                </span>
                <span className="w-2 h-2 rounded-full bg-pink-400" />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setFilterTag('todos')}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${filterTag === 'todos'
                      ? 'bg-amber-400 text-stone-900 shadow-sm'
                      : 'bg-white text-stone-600 hover:bg-pink-50 border border-pink-100'
                    }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterTag('destacados')}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${filterTag === 'destacados'
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:bg-pink-50 border border-pink-100'
                    }`}
                >
                  ⭐ Destacados
                </button>
              </div>
            </div>

            {/* TARJETAS DE MENSAJES */}
            <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12 px-6 bg-white/70 rounded-3xl border border-pink-100">
                  <span className="text-4xl block mb-2">💌</span>
                  <p className="font-display text-lg font-semibold text-stone-700">Sé el primero en bendecir a los novios</p>
                  <p className="text-xs text-stone-400 mt-1">Escribe tu mensaje en el formulario de la izquierda</p>
                </div>
              ) : (
                filteredMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`relative p-5 rounded-2xl bg-white/95 backdrop-blur-md shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${msg.isPinned
                        ? 'border-amber-300/80 bg-gradient-to-r from-amber-50/40 via-white to-pink-50/40'
                        : 'border-pink-100/70'
                      }`}
                  >
                    {msg.isPinned && (
                      <span className="absolute top-3 right-3 text-[0.65rem] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        ⭐ Mensaje Especial
                      </span>
                    )}

                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-100 to-amber-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm border border-white">
                        {msg.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap mb-1">
                          <h4 className="font-display text-base font-bold text-stone-900 truncate">
                            {msg.author}
                          </h4>
                          <span className="text-[0.68rem] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                            {msg.relationship}
                          </span>
                        </div>

                        <p className="text-xs text-stone-400 mb-2.5 font-medium">
                          {msg.timestamp}
                        </p>

                        <p className="text-sm text-stone-700 leading-relaxed break-words font-normal">
                          {msg.message}
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-pink-50 flex items-center justify-between">
                          <span className="text-[0.7rem] text-stone-400 italic">
                            Bendición para Wilian & Claudia
                          </span>
                          <button
                            type="button"
                            onClick={() => onLikeMessage(msg.id)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200 active:scale-95 transition-all cursor-pointer"
                          >
                            <span>❤️</span>
                            <span>{msg.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
