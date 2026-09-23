import React, { useState } from 'react'
import type { WeddingData, RsvpGuest } from '../types/wedding'
import { submitRsvpToBackend } from '../utils/storageService'

interface RsvpFormSectionProps {
  data: WeddingData
  onRsvpAdded?: (guest: RsvpGuest) => void
}

export function RsvpFormSection({ data, onRsvpAdded }: RsvpFormSectionProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guestsCount, setGuestsCount] = useState(1)
  const [attendance, setAttendance] = useState<'confirmed' | 'declined'>('confirmed')
  const [dietary, setDietary] = useState('Estándar')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confirmedGuest, setConfirmedGuest] = useState<RsvpGuest | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const cleanPhone = data.rsvpPhone.replace(/\D/g, '')
  const defaultWhatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    data.rsvpWhatsappMessage
  )}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Por favor completa tu nombre y número de teléfono')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const res = await submitRsvpToBackend({
        name: name.trim(),
        phone: phone.trim(),
        guestsCount,
        attendance,
        dietary,
        notes: notes.trim(),
      })

      const newGuest: RsvpGuest = res.data || {
        id: `rsvp-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        guestsCount,
        attendance,
        dietary,
        notes: notes.trim(),
        timestamp: 'Justo ahora',
      }

      setConfirmedGuest(newGuest)
      setSuccess(true)
      onRsvpAdded?.(newGuest)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Hubo un error al registrar tu confirmación')
    } finally {
      setLoading(false)
    }
  }

  const generatedWhatsappText = confirmedGuest
    ? `¡Hola ${data.groomName} y ${data.brideName}! Soy ${confirmedGuest.name}. ${
        confirmedGuest.attendance === 'confirmed'
          ? `Confirmo con mucha alegría mi asistencia (${confirmedGuest.guestsCount} ${
              confirmedGuest.guestsCount === 1 ? 'persona' : 'personas'
            }) a su Matrimonio Religioso y Civil el 24 de Octubre de 2026 🥂💍.`
          : 'Lamentablemente no podré asistir, pero les deseo de corazón lo mejor en su hermoso matrimonio.'
      }${confirmedGuest.notes ? ` Nota: ${confirmedGuest.notes}` : ''}`
    : data.rsvpWhatsappMessage

  const personalizedWhatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    generatedWhatsappText
  )}`

  return (
    <section
      id="rsvp"
      className="relative py-28 px-4 sm:px-6 lg:px-8 text-center text-white overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #6b21a8 45%, #9333ea 80%, #a21caf 100%)',
      }}
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-amber-400/30 to-fuchsia-500/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs font-bold uppercase tracking-[0.2em] shadow-lg mb-4">
          <span>💌</span>
          <span>Confirmación de Asistencia &bull; Lista de Honor</span>
        </div>

        <h2 className="font-script text-white text-4xl sm:text-6xl font-bold drop-shadow-lg mb-3">
          ¡Acompáñanos en Nuestro <em className="italic text-[#fae8c8]">Gran Día</em>!
        </h2>
        <p className="text-white/85 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
          Tu presencia es el regalo más hermoso para nosotros. Por favor confirma tus lugares antes del{' '}
          <strong className="text-amber-300 font-bold underline decoration-amber-400/50">
            {data.rsvpDeadline}
          </strong>{' '}
          para reservar tus asientos en la mesa de honor.
        </p>

        {/* MAIN LUXURY FORM CARD */}
        <div className="rounded-[36px] p-6 sm:p-10 bg-black/40 backdrop-blur-2xl border-2 border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-left relative overflow-hidden">
          {/* GOLD ORNAMENT CORNERS */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-300/60 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-300/60 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-300/60 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-300/60 rounded-br-xl pointer-events-none" />

          {success && confirmedGuest ? (
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-amber-300 flex items-center justify-center text-4xl shadow-xl animate-bounce">
                ✨
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-amber-200">
                  ¡Muchas Gracias, {confirmedGuest.name}!
                </h3>
                <p className="text-white/80 text-sm mt-2 max-w-md mx-auto">
                  {confirmedGuest.attendance === 'confirmed'
                    ? `Tu asistencia ha sido confirmada con éxito (${confirmedGuest.guestsCount} ${
                        confirmedGuest.guestsCount === 1 ? 'pase reservado' : 'pases reservados'
                      }) y registrada en la base de datos de gala.`
                    : 'Agradecemos de corazón tu aviso. Te tendremos siempre en nuestros corazones.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 max-w-md mx-auto text-xs text-white/80 space-y-1.5 text-left">
                <p>
                  <strong className="text-amber-300">Invitado:</strong> {confirmedGuest.name}
                </p>
                <p>
                  <strong className="text-amber-300">Teléfono:</strong> {confirmedGuest.phone}
                </p>
                <p>
                  <strong className="text-amber-300">Pases:</strong> {confirmedGuest.guestsCount}
                </p>
                <p>
                  <strong className="text-amber-300">Preferencia:</strong> {confirmedGuest.dietary}
                </p>
                {confirmedGuest.notes && (
                  <p>
                    <strong className="text-amber-300">Dedicatoria:</strong> &ldquo;
                    {confirmedGuest.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <a
                  href={personalizedWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-white shadow-xl flex items-center justify-center gap-2 bg-[#25D366] hover:scale-105 active:scale-95 transition"
                >
                  <span>💬</span>
                  <span>Enviar Copia por WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    setSuccess(false)
                    setName('')
                    setPhone('')
                    setNotes('')
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                  Registrar Otra Confirmación
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NOMBRE */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider">
                    👤 Tu Nombre y Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Carlos Pérez"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-amber-400 focus:bg-white/15 transition"
                  />
                </div>

                {/* TELEFONO */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider">
                    📱 Celular / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +51 984 123 456"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-amber-400 focus:bg-white/15 transition"
                  />
                </div>
              </div>

              {/* ASISTENCIA SELECTOR */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider">
                  ¿Nos acompañarás en la boda?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendance('confirmed')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold tracking-wide transition cursor-pointer ${
                      attendance === 'confirmed'
                        ? 'bg-gradient-to-r from-emerald-600/90 to-emerald-500/90 border-emerald-300 text-white shadow-lg scale-[1.02]'
                        : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span>🎉</span>
                    <span>¡Sí, confirmo mi asistencia!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendance('declined')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold tracking-wide transition cursor-pointer ${
                      attendance === 'declined'
                        ? 'bg-rose-900/80 border-rose-400 text-white shadow-lg scale-[1.02]'
                        : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span>😔</span>
                    <span>No podré asistir</span>
                  </button>
                </div>
              </div>

              {attendance === 'confirmed' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  {/* CANTIDAD DE PASES */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider">
                      🎟️ Número de Invitados (Pases)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setGuestsCount(num)}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            guestsCount === num
                              ? 'bg-amber-400 border-amber-300 text-black shadow-md'
                              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PREFERENCIA DE MENU */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider">
                      🍽️ Preferencia de Menú
                    </label>
                    <select
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#260f38] border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400 transition"
                    >
                      <option value="Estándar">Plato de Fondo Tradicional de Gala</option>
                      <option value="Vegetariano">Menú Vegetariano / Vegano</option>
                      <option value="Infantil">Menú Especial Infantil</option>
                      <option value="Sin Restricciones">Sin Restricciones Dietéticas</option>
                    </select>
                  </div>
                </div>
              )}

              {/* NOTAS O MENSAJE */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider">
                  ✍️ Mensaje o Felicitaciones para los Novios
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escribe aquí un hermoso mensaje o detalle para Luis y Victoria..."
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-amber-400 focus:bg-white/15 transition resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 text-xs">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* BOTON SUBMIT */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-wider text-black shadow-2xl flex items-center justify-center gap-2.5 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
                    boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  <span>{loading ? '⏳' : '✨'}</span>
                  <span>{loading ? 'Registrando en MySQL...' : 'Confirmar Asistencia Directa'}</span>
                </button>

                <a
                  href={defaultWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-4 rounded-full font-semibold text-xs text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center gap-2 transition whitespace-nowrap"
                  title="Confirmar directamente por chat de WhatsApp"
                >
                  <span className="text-emerald-400 text-base">💬</span>
                  <span>O confirmar por WhatsApp</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
