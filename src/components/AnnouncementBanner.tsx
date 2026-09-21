import { useState } from 'react'
import type { Announcement } from '../types/wedding'

export function AnnouncementBanner({ announcement }: { announcement?: Announcement }) {
  const [dismissed, setDismissed] = useState(false)

  if (!announcement || !announcement.active || dismissed) return null

  const getStyle = () => {
    switch (announcement.type) {
      case 'important':
        return {
          bg: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
          icon: '🚨',
          badge: 'Urgente',
        }
      case 'party':
        return {
          bg: 'linear-gradient(135deg, #c9a96e 0%, #d97fa8 100%)',
          icon: '🎉',
          badge: 'Celebración',
        }
      default:
        return {
          bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          icon: '✨',
          badge: 'Comunicado',
        }
    }
  }

  const current = getStyle()

  return (
    <div
      className="relative z-[990] w-full text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs md:text-sm font-medium transition-all"
      style={{ background: current.bg }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 px-6 text-center flex-wrap">
        <span className="text-base animate-bounce-gentle">{current.icon}</span>
        <span className="bg-white/20 uppercase tracking-widest text-[0.65rem] font-bold px-2 py-0.5 rounded-full border border-white/30">
          {announcement.title || current.badge}
        </span>
        <p className="tracking-wide">{announcement.message}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-colors flex-shrink-0 cursor-pointer"
        title="Ocultar aviso"
      >
        ✕
      </button>
    </div>
  )
}
