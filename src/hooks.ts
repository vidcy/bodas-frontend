import { useState, useEffect, useRef } from 'react'

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function useCountdown(targetDate: string): CountdownTime {
  const [time, setTime] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now())
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return time
}

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

export function useMusic(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [needsGesture, setNeedsGesture] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.85
    audioRef.current = audio

    const startAudio = () => {
      if (!audioRef.current) return
      audioRef.current
        .play()
        .then(() => {
          setPlaying(true)
          setNeedsGesture(false)
          cleanup()
        })
        .catch(() => {
          setNeedsGesture(true)
        })
    }

    const cleanup = () => {
      window.removeEventListener('pointerdown', startAudio)
      window.removeEventListener('click', startAudio)
      window.removeEventListener('touchstart', startAudio)
      window.removeEventListener('scroll', startAudio)
      window.removeEventListener('wheel', startAudio)
      window.removeEventListener('keydown', startAudio)
    }

    // Try direct play immediately
    startAudio()

    // Add immediate gesture listeners to unlock on any mouse movement, touch, or scroll
    window.addEventListener('pointerdown', startAudio, { once: true, passive: true })
    window.addEventListener('click', startAudio, { once: true, passive: true })
    window.addEventListener('touchstart', startAudio, { once: true, passive: true })
    window.addEventListener('scroll', startAudio, { once: true, passive: true })
    window.addEventListener('wheel', startAudio, { once: true, passive: true })
    window.addEventListener('keydown', startAudio, { once: true, passive: true })

    return () => {
      cleanup()
      audio.pause()
      audio.src = ''
    }
  }, [src])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => {
          setPlaying(true)
          setNeedsGesture(false)
        })
        .catch(() => {})
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return { playing, toggle, isMuted, toggleMute, needsGesture }
}

export { useCountdown }
