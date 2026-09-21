import { useState, useEffect, useRef } from 'react'
import type { InteractiveStory } from '../types/wedding'

interface StoriesBarProps {
  stories: InteractiveStory[]
}

export function StoriesBar({ stories }: StoriesBarProps) {
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([])
  const timerRef = useRef<number | null>(null)

  const activeStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null
  const durationMs = (activeStory?.duration || 5) * 1000

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeStoryIdx === null) return
      if (e.key === 'Escape') setActiveStoryIdx(null)
      if (e.key === 'ArrowRight') nextStory()
      if (e.key === 'ArrowLeft') prevStory()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeStoryIdx, stories.length])

  // Story progress timer
  useEffect(() => {
    if (activeStoryIdx === null || isPaused) return

    const interval = 50
    const step = (interval / durationMs) * 100

    timerRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (activeStoryIdx < stories.length - 1) {
            setActiveStoryIdx(activeStoryIdx + 1)
            return 0
          } else {
            setActiveStoryIdx(null)
            return 0
          }
        }
        return prev + step
      })
    }, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeStoryIdx, isPaused, durationMs, stories.length])

  const openStory = (idx: number) => {
    setActiveStoryIdx(idx)
    setProgress(0)
    setIsPaused(false)
  }

  const nextStory = () => {
    if (activeStoryIdx === null) return
    if (activeStoryIdx < stories.length - 1) {
      setActiveStoryIdx(activeStoryIdx + 1)
      setProgress(0)
    } else {
      setActiveStoryIdx(null)
    }
  }

  const prevStory = () => {
    if (activeStoryIdx === null) return
    if (activeStoryIdx > 0) {
      setActiveStoryIdx(activeStoryIdx - 1)
      setProgress(0)
    } else {
      setProgress(0)
    }
  }

  const triggerHeart = () => {
    const newHeart = { id: Date.now() + Math.random(), left: 40 + Math.random() * 20 }
    setFloatingHearts(prev => [...prev, newHeart])
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id))
    }, 1500)
  }

  if (!stories || stories.length === 0) return null

  return (
    <section className="relative z-30 py-6 px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#d97fa8' }}>
            Momentos en Vivo · Stories
          </span>
        </div>
        <span className="text-[0.7rem] font-medium text-amber-700/70 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
          Toca para ver
        </span>
      </div>

      {/* HORIZONTAL STORIES REEL */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 px-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {stories.map((story, i) => (
          <button
            key={story.id || i}
            onClick={() => openStory(i)}
            className="flex flex-col items-center gap-2 group flex-shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95"
          >
            {/* GRADIENT GLOW RING */}
            <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-amber-400 via-pink-400 to-purple-500 shadow-md group-hover:shadow-pink-300/50 group-hover:scale-105 transition-all duration-300">
              <div className="p-[2px] rounded-full bg-white">
                <img
                  src={story.mediaUrl}
                  alt={story.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover group-hover:rotate-2 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-pink-500 text-white text-[0.65rem] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                ❤️
              </span>
            </div>
            <span className="text-[0.75rem] font-semibold text-stone-800 max-w-[80px] truncate text-center group-hover:text-pink-600 transition-colors">
              {story.title}
            </span>
          </button>
        ))}
      </div>

      {/* FULLSCREEN STORY VIEWER MODAL */}
      {activeStoryIdx !== null && activeStory && (
        <div
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex items-center justify-center select-none"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* STORY CARD CONTAINER */}
          <div className="relative w-full max-w-md h-full max-h-[92vh] md:rounded-3xl overflow-hidden flex flex-col bg-stone-900 shadow-2xl border border-white/10">
            {/* TOP PROGRESS BARS */}
            <div className="absolute top-0 left-0 right-0 z-40 flex items-center gap-1.5 p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              {stories.map((s, idx) => {
                let barFill = 0
                if (idx < activeStoryIdx) barFill = 100
                else if (idx === activeStoryIdx) barFill = progress

                return (
                  <div key={s.id || idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                      style={{ width: `${barFill}%` }}
                    />
                  </div>
                )
              })}
            </div>

            {/* HEADER WITH COUPLE INFO & CLOSE */}
            <div className="absolute top-6 left-0 right-0 z-40 flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-3">
                <img
                  src={activeStory.mediaUrl}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border-2 border-pink-400 shadow-sm"
                />
                <div>
                  <h4 className="text-white text-xs font-bold tracking-wide drop-shadow-md">
                    {activeStory.title}
                  </h4>
                  <p className="text-white/70 text-[0.65rem]">
                    {activeStory.timestamp || 'Boda 2025'}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveStoryIdx(null)
                }}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center text-sm transition-colors border border-white/20 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* MAIN STORY MEDIA */}
            <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-black">
              <img
                src={activeStory.mediaUrl}
                alt={activeStory.title}
                className="w-full h-full object-cover"
              />

              {/* TAP REGIONS: LEFT TO GO PREV, RIGHT TO GO NEXT */}
              <div
                className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  prevStory()
                }}
              />
              <div
                className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  nextStory()
                }}
              />

              {/* FLOATING HEARTS ANIMATION */}
              {floatingHearts.map((heart) => (
                <span
                  key={heart.id}
                  className="absolute bottom-20 text-3xl pointer-events-none animate-bounce"
                  style={{
                    left: `${heart.left}%`,
                    animation: 'floatUp 1.4s ease-out forwards',
                  }}
                >
                  💖
                </span>
              ))}
            </div>

            {/* BOTTOM CAPTION & REACTION */}
            <div className="relative z-30 p-5 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-3">
              {activeStory.caption && (
                <p className="text-white text-sm font-medium leading-relaxed drop-shadow-md bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/10">
                  {activeStory.caption}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[0.68rem] text-white/70 italic">
                  {isPaused ? '⏸️ Pausado' : '▶️ Reproduciendo historia'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerHeart()
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>❤️</span>
                  <span>Enviar amor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
