import { useState, useEffect } from 'react'
import { checkBackendHealth } from '../utils/storageService'

interface BackendStatusBadgeProps {
  onSyncRequested?: () => void
}

export function BackendStatusBadge({ onSyncRequested }: BackendStatusBadgeProps) {
  const [health, setHealth] = useState<{
    ok: boolean
    message: string
    latencyMs: number
    details?: any
  }>({
    ok: false,
    message: 'Verificando...',
    latencyMs: 0,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const verifyHealth = async () => {
    setIsChecking(true)
    const result = await checkBackendHealth()
    setHealth(result)
    setIsChecking(false)
  }

  useEffect(() => {
    verifyHealth()
    const interval = setInterval(verifyHealth, 20000) // cada 20 segundos
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* FLOATING STATUS PILL */}
      <div className="fixed bottom-5 right-5 z-[9990]">
        <button
          onClick={() => setModalOpen(true)}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full backdrop-blur-xl border shadow-xl text-xs font-semibold tracking-wide transition-all duration-300 hover:scale-105 cursor-pointer ${
            health.ok
              ? 'bg-[#12071f]/85 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              : 'bg-[#1a0f05]/90 border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
          }`}
          title="Ver estado de conexión a la Base de Datos MySQL"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                health.ok ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                health.ok ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span>{health.ok ? `MySQL Conectado (${health.latencyMs}ms)` : 'Modo Offline (IndexedDB)'}</span>
          <span className="text-[10px] text-white/50">⚡</span>
        </button>
      </div>

      {/* DIAGNOSTIC MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl p-6 bg-[#1a0a2a]/95 border-2 border-purple-500/40 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏛️</span>
                <div>
                  <h3 className="font-bold text-base text-amber-200">
                    Sistema de Datos &amp; Base de Datos
                  </h3>
                  <p className="text-xs text-white/60">NestJS + Prisma ORM + MySQL 8.0</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/60 hover:text-white text-xl p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/70">Estado del Backend NestJS</span>
                <span className={`font-bold flex items-center gap-1.5 ${health.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <span>{health.ok ? '●' : '○'}</span>
                  {health.ok ? 'Activo (Puerto 3000)' : 'Sin respuesta / Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/70">Base de Datos MySQL</span>
                <span className={`font-bold ${health.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {health.ok ? 'MySQL80 (Base: bodas)' : 'En espera'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/70">Latencia de Red / Query</span>
                <span className="font-mono text-purple-300 font-bold">
                  {health.latencyMs} ms
                </span>
              </div>

              {health.details?.stats && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center">
                    <p className="text-lg font-bold text-amber-300">
                      {health.details.stats.rsvps ?? 0}
                    </p>
                    <span className="text-[11px] text-white/70">Confirmados (RSVP)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center">
                    <p className="text-lg font-bold text-amber-300">
                      {health.details.stats.messages ?? 0}
                    </p>
                    <span className="text-[11px] text-white/70">Firmas en el Libro</span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white/5 text-[11px] text-white/60 leading-relaxed">
                ℹ️ Todos los cambios guardados desde el Panel Administrativo, confirmaciones de asistencia y firmas se sincronizan bidireccionalmente con tu base de datos MySQL local y con respaldo seguro en el navegador.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  verifyHealth()
                  onSyncRequested?.()
                }}
                disabled={isChecking}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 font-bold text-xs shadow-lg hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isChecking ? 'Verificando...' : '🔄 Probar Conexión Ahora'}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
