import React, { useState, useEffect, useRef } from 'react'
import type { GuestbookMessage } from '../types/wedding'
import { likeGuestbookMessageInBackend } from '../utils/storageService'

interface WeddingLiveChatProps {
  messages: GuestbookMessage[]
  onSendMessage: (msg: { author: string; relationship: string; message: string; emoji: string }) => void
  onLikeMessage?: (id: string) => void
}

const QUICK_CHEERS = [
  '🎉 ¡Que vivan los novios!',
  '🥂 ¡Muchas felicidades Luis y Victoria!',
  '💍 ¡Que Dios bendiga su sagrada unión!',
  '❤️ ¡Hermosa boda y hermosa familia!',
  '✨ ¡Listos para celebrar en El Golazo!',
]

const AVATAR_OPTIONS = ['💍', '🥂', '🌸', '👑', '🎉', '🕊️', '💐', '✨']

export function WeddingLiveChat({ messages, onSendMessage, onLikeMessage }: WeddingLiveChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [author, setAuthor] = useState(() => localStorage.getItem('wedding_chat_author') || '')
  const [relationship, setRelationship] = useState('Invitado de Honor')
  const [message, setMessage] = useState('')
  const [avatar, setAvatar] = useState('🌸')
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [isOpen, messages.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !message.trim()) return

    setIsSending(true)
    localStorage.setItem('wedding_chat_author', author.trim())

    onSendMessage({
      author: author.trim(),
      relationship,
      message: message.trim(),
      emoji: avatar,
    })

    setMessage('')
    setIsSending(false)
  }

  return (
    <>
      {/* FLOATING CHAT TRIGGER BUTTON */}
      <div className="fixed bottom-20 right-5 z-[9980]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-amber-500 text-white font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/40 cursor-pointer shadow-[0_10px_30px_rgba(168,85,247,0.4)]"
          title="Abrir Chat en Vivo de Invitados y Familiares"
        >
          <span className="text-lg animate-bounce">💬</span>
          <span className="hidden sm:inline">Chat en Vivo</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black border border-white/30">
            {messages.length}
          </span>
          {/* NOTIFICATION DOT */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300" />
          </span>
        </button>
      </div>

      {/* CHAT WINDOW / MODAL */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[420px] max-h-[580px] h-[550px] flex flex-col rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-2 border-purple-400/50 bg-[#160722]/95 backdrop-blur-2xl text-white animate-fade-in">
          {/* CHAT HEADER */}
          <div className="p-4 bg-gradient-to-r from-purple-900 via-fuchsia-900 to-[#1e0a2d] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-purple-600 flex items-center justify-center text-xl shadow-md border border-white/20">
                💬
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-200">
                  Chat en Vivo &bull; Luis &amp; Victoria
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Conectado a MySQL &bull; {messages.length} mensajes</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-white/60 space-y-2">
                <span className="text-4xl block">✨</span>
                <p className="text-xs font-semibold">¡Sé el primero en enviar felicitaciones!</p>
                <p className="text-[11px] text-white/40">Tus palabras quedarán grabadas en el libro oficial.</p>
              </div>
            ) : (
              messages
                .slice()
                .reverse()
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1.5 transition-all hover:bg-white/15"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base p-1 rounded-lg bg-white/10">{m.emoji || '🌸'}</span>
                        <div>
                          <strong className="text-xs font-bold text-amber-300 block">{m.author}</strong>
                          <span className="text-[10px] text-purple-300/80">{m.relationship}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/50">{m.timestamp}</span>
                    </div>

                    <p className="text-xs text-white/90 leading-relaxed pl-1">{m.message}</p>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => {
                          likeGuestbookMessageInBackend(m.id).catch(() => {})
                          onLikeMessage?.(m.id)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] text-pink-300 transition cursor-pointer"
                      >
                        <span>❤️</span>
                        <span>{m.likes || 1}</span>
                      </button>
                    </div>
                  </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK CHEER PILLS */}
          <div className="px-3 py-2 bg-black/40 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {QUICK_CHEERS.map((cheer, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMessage(cheer)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/10 hover:bg-purple-600/50 border border-white/20 text-[10px] text-white/90 transition cursor-pointer"
              >
                {cheer}
              </button>
            ))}
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSubmit} className="p-3 bg-[#11051b] border-t border-white/10 space-y-2">
            {!author && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre..."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="px-2 py-1.5 rounded-xl bg-[#250d36] border border-white/20 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Invitado de Honor">Invitado de Honor</option>
                  <option value="Familiar de Luis">Familia de Luis</option>
                  <option value="Familiar de Victoria">Familia de Victoria</option>
                  <option value="Amigo de los Novios">Amigo de los Novios</option>
                  <option value="Padrino / Madrina">Padrino / Madrina</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {AVATAR_OPTIONS.slice(0, 3).map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-7 h-7 rounded-lg text-sm transition cursor-pointer ${
                      avatar === av ? 'bg-amber-400/40 border border-amber-300' : 'bg-white/10'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>

              <input
                type="text"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje en vivo..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
              />

              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 font-bold text-xs text-white shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
