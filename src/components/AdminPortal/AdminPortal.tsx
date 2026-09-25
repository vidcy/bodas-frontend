import { useState, useRef, useEffect } from 'react'
import type {
  WeddingData,
  InteractiveStory,
  VideoItem,
  RsvpGuest
} from '../../types/wedding'
import { optimizeImage, getBase64SizeKb } from '../../utils/imageOptimizer'
import {
  exportToJson,
  importFromJson,
  downloadConfigFile,
  getCloudConfig,
  saveCloudConfig,
  uploadPhotoToBackend,
  saveStoredWeddingData,
  getBackendApiUrl,
  setCustomBackendApiUrl,
  type CloudConfig
} from '../../utils/storageService'
import { SafeImage } from '../SafeImage'

interface AdminPortalProps {
  open: boolean
  onClose: () => void
  data: WeddingData
  onSaveData: (newData: WeddingData) => void
  onDeleteGuestbookMessage: (id: string) => void
  onTogglePinMessage: (id: string) => void
}

export function AdminPortal({
  open,
  onClose,
  data,
  onSaveData,
  onDeleteGuestbookMessage,
  onTogglePinMessage,
}: AdminPortalProps) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('wedding_admin_auth') === '1'
  )
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Working copy of data
  const [localData, setLocalData] = useState<WeddingData>(data)
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'comunicados' | 'banners' | 'stories' | 'videos' | 'galeria' | 'foro' | 'rsvp' | 'general' | 'respaldos'
  >('dashboard')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')
  const [saveErrorMsg, setSaveErrorMsg] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizingMsg, setOptimizingMsg] = useState('')

  // Sincronizar localData con la base de datos fresca cada vez que se abre el modal o cambia data
  useEffect(() => {
    if (open && data) {
      setLocalData(data)
    }
  }, [open, data])

  // File upload refs
  const bannerFileRef = useRef<HTMLInputElement>(null)
  const coupleFileRef = useRef<HTMLInputElement>(null)
  const galleryFileRef = useRef<HTMLInputElement>(null)
  const storyFileRef = useRef<HTMLInputElement>(null)
  const qrFileRef = useRef<HTMLInputElement>(null)
  const backupFileRef = useRef<HTMLInputElement>(null)

  // Cloud Sync state
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(() => getCloudConfig())
  const [cloudMsg, setCloudMsg] = useState('')

  // Story creator state
  const [newStoryTitle, setNewStoryTitle] = useState('')
  const [newStoryCaption, setNewStoryCaption] = useState('')
  const [newStoryUrl, setNewStoryUrl] = useState('')

  // Video creator state
  const [newVideoTitle, setNewVideoTitle] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [newVideoCat, setNewVideoCat] = useState('Momentos')

  // Photo URL state
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newPhotoCaption, setNewPhotoCaption] = useState('')
  const [newPhotoCategory, setNewPhotoCategory] = useState<'historia' | 'preboda' | 'civil' | 'fiesta'>('preboda')

  // Guest search state
  const [guestSearch, setGuestSearch] = useState('')
  const [newGuestName, setNewGuestName] = useState('')
  const [newGuestCount, setNewGuestCount] = useState(1)
  const [newGuestPhone, setNewGuestPhone] = useState('')

  // Backend connection state
  const [customBackendUrl, setCustomBackendUrl] = useState(() => getBackendApiUrl())
  const [showServerConfig, setShowServerConfig] = useState(false)
  const [backendHealthStatus, setBackendHealthStatus] = useState<{
    tested: boolean
    ok: boolean
    message: string
    details?: any
  }>({ tested: false, ok: false, message: '' })

  const handleTestBackendConnection = async (targetUrl?: string) => {
    const urlToTest = (targetUrl || customBackendUrl).trim().replace(/\/+$/, '')
    setBackendHealthStatus({ tested: true, ok: false, message: 'Probando conexión...' })
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 4000)
      const res = await fetch(`${urlToTest}/wedding/health`, { signal: controller.signal })
      clearTimeout(timeout)
      if (res.ok) {
        const json = await res.json()
        setBackendHealthStatus({
          tested: true,
          ok: true,
          message: '¡Conexión Exitosa con MySQL y DigitalOcean Spaces!',
          details: json
        })
      } else {
        setBackendHealthStatus({
          tested: true,
          ok: false,
          message: `El servidor respondió con código HTTP ${res.status}`
        })
      }
    } catch (e: any) {
      setBackendHealthStatus({
        tested: true,
        ok: false,
        message: `No se pudo conectar: ${e.message || 'Servidor no alcanzable'}`
      })
    }
  }

  const handleSaveBackendUrl = (url: string) => {
    setCustomBackendApiUrl(url)
    setCustomBackendUrl(getBackendApiUrl())
    handleTestBackendConnection(url)
  }

  if (!open) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setAuthError('')
    const activeApi = getBackendApiUrl()
    try {
      let res: Response | null = null
      // 1. Intentar a través de la URL activa del Backend
      try {
        res = await fetch(`${activeApi}/wedding/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: user.trim(), pass: pass.trim() }),
        })
      } catch {
        // 2. Fallback al proxy local /api
        res = await fetch('/api/wedding/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: user.trim(), pass: pass.trim() }),
        }).catch(() => null)
      }

      if (res && res.ok) {
        const json = await res.json()
        if (json.success) {
          sessionStorage.setItem('wedding_admin_auth', '1')
          if (json.token) {
            sessionStorage.setItem('wedding_admin_token', json.token)
          }
          setAuthenticated(true)
          setAuthError('')
          return
        }
      }

      if (res) {
        const json = await res.json().catch(() => null)
        setAuthError(json?.message || json?.error || 'Usuario o contraseña incorrectos. Intenta con admin / bodas2026')
      } else {
        setAuthError(`No se pudo conectar con el servidor backend (${activeApi}). Verifica que esté corriendo en Railway o localmente.`)
        setShowServerConfig(true)
      }
    } catch {
      setAuthError(`Error de red al conectar con: ${activeApi}`)
      setShowServerConfig(true)
    } finally {
      setIsLoggingIn(false)
      setPass('')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('wedding_admin_auth')
    sessionStorage.removeItem('wedding_admin_token')
    setAuthenticated(false)
  }

  const handleSave = async (customData?: WeddingData) => {
    const toSave = customData || localData
    setIsSaving(true)
    setSaveSuccessMsg('')
    setSaveErrorMsg('')
    try {
      const res = await saveStoredWeddingData(toSave)
      onSaveData(toSave)
      setLocalData(toSave)
      if (res.success || res.cloudSynced) {
        setSaveSuccessMsg('✅ ¡Cambios guardados con éxito en la base de datos MySQL!')
        setTimeout(() => setSaveSuccessMsg(''), 4000)
      } else {
        setSaveErrorMsg(res.error || 'Aviso: No se pudo confirmar el guardado en el servidor backend.')
        setTimeout(() => setSaveErrorMsg(''), 4000)
      }
    } catch (err: any) {
      setSaveErrorMsg(`Error al guardar: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Upload helper con soporte para Backend NestJS y compresión inteligente WebP
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsOptimizing(true)
      setOptimizingMsg(`Procesando "${file.name}"...`)

      // 1. Intentar subir como archivo real al Backend NestJS si está activo
      const uploadedUrl = await uploadPhotoToBackend(file)
      if (uploadedUrl) {
        callback(uploadedUrl)
        setOptimizingMsg(`✅ Foto guardada en el servidor NestJS`)
        setTimeout(() => setOptimizingMsg(''), 2500)
        return
      }

      // 2. Fallback a compresión WebP en cliente (IndexedDB)
      setOptimizingMsg(`Optimizando a WebP de alta resolución...`)
      const optimizedUrl = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.82
      })
      const sizeKb = getBase64SizeKb(optimizedUrl)
      callback(optimizedUrl)
      setOptimizingMsg(`✅ Imagen optimizada con éxito (~${sizeKb} KB)`)
      setTimeout(() => setOptimizingMsg(''), 2500)
    } catch (err) {
      console.error('Error optimizando foto:', err)
      alert('Hubo un error al procesar la imagen. Intenta con otra foto.')
    } finally {
      setIsOptimizing(false)
      e.target.value = ''
    }
  }

  // Add new story
  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStoryTitle || !newStoryUrl) return
    const newStory: InteractiveStory = {
      id: `story-${Date.now()}`,
      title: newStoryTitle,
      mediaUrl: newStoryUrl,
      type: 'image',
      caption: newStoryCaption,
      timestamp: 'Reciente',
      duration: 5,
    }
    const updated = { ...localData, stories: [newStory, ...localData.stories] }
    setLocalData(updated)
    handleSave(updated)
    setNewStoryTitle('')
    setNewStoryCaption('')
    setNewStoryUrl('')
  }

  // Add new video
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVideoTitle || !newVideoUrl) return
    const newVideo: VideoItem = {
      id: `vid-${Date.now()}`,
      title: newVideoTitle,
      url: newVideoUrl,
      platform: 'youtube',
      category: newVideoCat,
    }
    const updated = { ...localData, videos: [...localData.videos, newVideo] }
    setLocalData(updated)
    handleSave(updated)
    setNewVideoTitle('')
    setNewVideoUrl('')
  }

  // Add photo
  const handleAddPhoto = () => {
    if (!newPhotoUrl) return
    const newPhoto = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl,
      caption: newPhotoCaption,
      category: newPhotoCategory,
    }
    const updated = { ...localData, galleryPhotos: [...localData.galleryPhotos, newPhoto] }
    setLocalData(updated)
    handleSave(updated)
    setNewPhotoUrl('')
    setNewPhotoCaption('')
  }

  // Add manual RSVP
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGuestName) return
    const newGuest: RsvpGuest = {
      id: `rsvp-${Date.now()}`,
      name: newGuestName,
      phone: newGuestPhone || '+51 900000000',
      guestsCount: Number(newGuestCount) || 1,
      attendance: 'confirmed',
      dietary: 'Estándar',
      timestamp: new Date().toLocaleString('es-PE'),
    }
    const updated = { ...localData, rsvpList: [newGuest, ...localData.rsvpList] }
    setLocalData(updated)
    handleSave(updated)
    setNewGuestName('')
    setNewGuestCount(1)
    setNewGuestPhone('')
  }

  // Export RSVP to CSV
  const handleExportRsvpCsv = () => {
    const headers = ['Nombre', 'Teléfono', 'Asistencia', 'Pases/Invitados', 'Dieta', 'Fecha']
    const rows = localData.rsvpList.map(g => [
      `"${g.name}"`,
      `"${g.phone}"`,
      `"${g.attendance}"`,
      g.guestsCount,
      `"${g.dietary || ''}"`,
      `"${g.timestamp}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `invitados_boda_${localData.groomName}_${localData.brideName}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Metrics
  const totalConfirmedGuests = localData.rsvpList
    .filter(g => g.attendance === 'confirmed')
    .reduce((acc, g) => acc + g.guestsCount, 0)

  return (
    <div className="fixed inset-0 z-[10001] bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none">
      {/* LOGIN VIEW */}
      {!authenticated ? (
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-pink-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-400 to-rose-400 text-white text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-pink-300/40">
              👑
            </div>
            <h3 className="font-display text-2xl font-bold text-stone-800">
              Portal de Administración
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Acceso exclusivo para los novios y organizadores
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="admin"
                className="field-input"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••"
                className="field-input"
                autoComplete="current-password"
                required
              />
            </div>

            {authError && (
              <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2.5 rounded-xl border border-red-200">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-gold w-full justify-center py-3.5 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? 'Validando con el backend...' : 'Ingresar al Portal'}
            </button>

            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowServerConfig(!showServerConfig)}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1.5 w-full py-1 cursor-pointer transition-colors"
              >
                <span>⚙️</span>
                <span>{showServerConfig ? 'Ocultar ajustes de servidor' : 'Configurar URL de Railway / Backend'}</span>
              </button>

              {showServerConfig && (
                <div className="mt-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2 animate-fade-in">
                  <label className="block text-[11px] font-bold text-stone-700">
                    URL API del Backend (NestJS / Railway)
                  </label>
                  <input
                    type="url"
                    value={customBackendUrl}
                    onChange={(e) => setCustomBackendUrl(e.target.value)}
                    placeholder="https://tu-backend.up.railway.app/api"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveBackendUrl(customBackendUrl)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition cursor-pointer"
                    >
                      Guardar URL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTestBackendConnection()}
                      className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      Probar Salud
                    </button>
                  </div>
                  {backendHealthStatus.tested && (
                    <div className={`p-2 rounded-lg text-[11px] font-medium ${backendHealthStatus.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                      {backendHealthStatus.message}
                      {backendHealthStatus.details?.cloudStorage && (
                        <div className="mt-1 text-[10px] text-stone-600">
                          📦 {backendHealthStatus.details.cloudStorage.provider} (Bucket: {backendHealthStatus.details.cloudStorage.bucket})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-[0.68rem] text-stone-400 text-center mt-1">
              Conectado a: <code className="bg-stone-100 px-1 py-0.5 rounded text-[10px] text-stone-600">{getBackendApiUrl()}</code>
            </p>
          </form>
        </div>
      ) : (
        /* FULL PORTAL VIEW */
        <div className="w-full max-w-6xl h-full max-h-[92vh] bg-stone-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/40">
          {/* PORTAL TOP BAR */}
          <div className="bg-white px-6 py-4 border-b border-pink-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-xl bg-amber-50 border border-amber-200">👑</span>
              <div>
                <h3 className="font-display text-xl font-bold text-stone-800">
                  Panel de Control · {data.groomName} & {data.brideName}
                </h3>
                <p className="text-[0.68rem] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sesión activa como Administrador
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOptimizing && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-spin" />
                  Optimizando imagen...
                </span>
              )}
              {optimizingMsg && !isOptimizing && (
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                  {optimizingMsg}
                </span>
              )}
              {saveSuccessMsg && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 animate-bounce">
                  {saveSuccessMsg}
                </span>
              )}
              {saveErrorMsg && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200">
                  {saveErrorMsg}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="btn-gold text-xs py-2 px-4 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? '💾 Guardando en MySQL...' : '💾 Guardar Cambios'}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* MAIN PORTAL BODY: SIDEBAR + CONTENT */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* SIDEBAR TABS */}
            <div className="w-full md:w-64 bg-white/80 border-r border-pink-100 flex md:flex-col overflow-x-auto md:overflow-y-auto p-3 gap-1 flex-shrink-0 scrollbar-none">
              {[
                { id: 'dashboard', label: 'Dashboard & Métricas', icon: '📊' },
                { id: 'comunicados', label: 'Avisos & Comunicados', icon: '📢' },
                { id: 'banners', label: 'Banners & Fondos', icon: '🖼️' },
                { id: 'stories', label: 'Historias (Stories)', icon: '📱' },
                { id: 'videos', label: 'Sala de Videos', icon: '🎬' },
                { id: 'galeria', label: 'Galería & Collage', icon: '📸' },
                { id: 'foro', label: 'Moderación de Foro', icon: '💬' },
                { id: 'rsvp', label: 'Invitados & Asistencia', icon: '👥' },
                { id: 'general', label: 'Configuración General', icon: '⚙️' },
                { id: 'respaldos', label: 'Nube & Respaldos PRO', icon: '☁️' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left text-xs font-bold transition-all flex-shrink-0 md:w-full cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-rose-400 text-white shadow-md shadow-pink-300/30'
                      : 'text-stone-600 hover:bg-pink-50/70 hover:text-stone-900'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-stone-50/50">
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-pink-100 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Total Confirmados
                      </span>
                      <p className="text-3xl font-display font-bold text-pink-600 mt-2">
                        {totalConfirmedGuests} / {localData.maxGuests}
                      </p>
                      <span className="text-[0.7rem] text-stone-400 mt-1">Personas registradas</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-pink-100 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Mensajes de Amor
                      </span>
                      <p className="text-3xl font-display font-bold text-amber-600 mt-2">
                        {localData.guestbook.length}
                      </p>
                      <span className="text-[0.7rem] text-stone-400 mt-1">Bendiciones en el foro</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-pink-100 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Historias Activas
                      </span>
                      <p className="text-3xl font-display font-bold text-purple-600 mt-2">
                        {localData.stories.length}
                      </p>
                      <span className="text-[0.7rem] text-stone-400 mt-1">Momentos en vivo</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-pink-100 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Fotos en Galería
                      </span>
                      <p className="text-3xl font-display font-bold text-rose-600 mt-2">
                        {localData.galleryPhotos.length}
                      </p>
                      <span className="text-[0.7rem] text-stone-400 mt-1">Collage interactivo</span>
                    </div>
                  </div>

                  {/* QUICK STATUS CARD */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-lg font-bold text-stone-800 mb-2">
                      Estado del Evento
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed mb-4">
                      Fecha: <strong>{new Date(localData.weddingDate).toLocaleDateString()}</strong> · Iglesia: <strong>{localData.ceremonyVenue}</strong> · Salón: <strong>{localData.receptionVenue}</strong>
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => setActiveTab('comunicados')}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition-colors"
                      >
                        📢 Emitir un comunicado
                      </button>
                      <button
                        onClick={() => setActiveTab('stories')}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        📱 Agregar una Historia
                      </button>
                      <button
                        onClick={() => setActiveTab('rsvp')}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      >
                        👥 Ver lista de invitados
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* COMUNICADOS TAB */}
              {activeTab === 'comunicados' && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-xl font-bold text-stone-800">
                        Banner de Comunicados & Alertas
                      </h4>
                      <p className="text-xs text-stone-500">
                        Muestra un aviso fijado en la parte superior de la página web para todos los invitados
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localData.announcement.active}
                        onChange={e =>
                          setLocalData(prev => ({
                            ...prev,
                            announcement: { ...prev.announcement, active: e.target.checked },
                          }))
                        }
                        className="w-5 h-5 accent-pink-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-stone-700">
                        {localData.announcement.active ? '🟢 Banner Activado' : '⚪ Banner Desactivado'}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Título del Anuncio
                    </label>
                    <input
                      type="text"
                      value={localData.announcement.title}
                      onChange={e =>
                        setLocalData(prev => ({
                          ...prev,
                          announcement: { ...prev.announcement, title: e.target.value },
                        }))
                      }
                      placeholder="Ej: ✨ Aviso Importante para Invitados"
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Tipo de Anuncio (Color y Estilo)
                    </label>
                    <select
                      value={localData.announcement.type}
                      onChange={e =>
                        setLocalData(prev => ({
                          ...prev,
                          announcement: {
                            ...prev.announcement,
                            type: e.target.value as 'info' | 'important' | 'party',
                          },
                        }))
                      }
                      className="field-input bg-white cursor-pointer"
                    >
                      <option value="info">Informativo (Azul / Morado)</option>
                      <option value="important">Urgente / Alerta (Rosa / Fucsia)</option>
                      <option value="party">Celebración / Fiesta (Dorado / Rosa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Mensaje del Anuncio
                    </label>
                    <textarea
                      rows={3}
                      value={localData.announcement.message}
                      onChange={e =>
                        setLocalData(prev => ({
                          ...prev,
                          announcement: { ...prev.announcement, message: e.target.value },
                        }))
                      }
                      placeholder="Escribe el mensaje que verán los invitados..."
                      className="field-input"
                    />
                  </div>

                  <button
                    onClick={() => handleSave()}
                    className="btn-gold text-xs py-3 px-6"
                  >
                    Guardar Aviso
                  </button>
                </div>
              )}

              {/* BANNERS & FONDOS TAB */}
              {activeTab === 'banners' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-xl font-bold text-stone-800 mb-2">
                      Fondo Principal de Pantalla (Hero Banner)
                    </h4>
                    <p className="text-xs text-stone-500 mb-4">
                      Esta foto ocupará toda la pantalla de bienvenida con efectos de partículas
                    </p>

                    {localData.heroBannerUrl && (
                      <div className="relative rounded-2xl overflow-hidden h-44 mb-4 border border-stone-200">
                        <SafeImage
                          src={localData.heroBannerUrl}
                          alt="Hero Banner"
                          style={{ objectPosition: localData.heroPhotoPosition || 'center 30%' }}
                          className="w-full h-full object-cover transition-all"
                        />
                      </div>
                    )}

                    {/* ENFOQUE / CENTRADO HERO */}
                    <div className="mb-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[0.68rem] font-bold text-stone-600 block mb-1.5 uppercase tracking-wider">
                        🎯 Punto de Enfoque / Centrado (¿Qué parte enfocar?)
                      </span>
                      <div className="flex gap-2 flex-wrap text-xs">
                        {[
                          { label: '⬆️ Arriba (Rostros)', val: 'center top' },
                          { label: '🎯 Centro', val: 'center center' },
                          { label: '⬇️ Abajo (Cuerpo)', val: 'center bottom' },
                        ].map(pos => (
                          <button
                            key={pos.val}
                            type="button"
                            onClick={() => setLocalData(prev => ({ ...prev, heroPhotoPosition: pos.val }))}
                            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                              localData.heroPhotoPosition === pos.val
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-white text-stone-700 hover:bg-purple-50 border border-stone-200'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 items-center flex-wrap">
                      <div
                        onClick={() => bannerFileRef.current?.click()}
                        className="upload-zone flex-1 py-4 cursor-pointer"
                      >
                        <span className="text-2xl block">📤</span>
                        <span className="text-xs font-bold text-pink-600">
                          Subir imagen desde mi dispositivo
                        </span>
                      </div>
                      <input
                        ref={bannerFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e =>
                          handleFileUpload(e, url => {
                            const updated = { ...localData, heroBannerUrl: url }
                            setLocalData(updated)
                            handleSave(updated)
                          })
                        }
                      />
                    </div>
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="O ingresa la URL de la imagen de banner"
                        value={localData.heroBannerUrl || ''}
                        onChange={e =>
                          setLocalData(prev => ({ ...prev, heroBannerUrl: e.target.value }))
                        }
                        className="field-input text-xs"
                      />
                    </div>
                  </div>

                  {/* FOTO PRINCIPAL DE LA PAREJA */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-xl font-bold text-stone-800 mb-2">
                      Foto Oficial de la Pareja (La Luz Principal)
                    </h4>
                    <p className="text-xs text-stone-500 mb-4">
                      Esta foto aparece iluminada en el centro del Hero y en la presentación oficial
                    </p>

                    {localData.mainCouplePhoto && (
                      <div className="relative rounded-2xl overflow-hidden h-44 mb-4 border border-stone-200">
                        <SafeImage
                          src={localData.mainCouplePhoto}
                          alt="Couple"
                          style={{ objectPosition: localData.couplePhotoPosition || 'center 20%' }}
                          className="w-full h-full object-cover transition-all"
                        />
                      </div>
                    )}

                    {/* ENFOQUE / CENTRADO FOTO DE PAREJA */}
                    <div className="mb-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[0.68rem] font-bold text-stone-600 block mb-1.5 uppercase tracking-wider">
                        🎯 Punto de Enfoque / Centrado (¿Qué parte enfocar?)
                      </span>
                      <div className="flex gap-2 flex-wrap text-xs">
                        {[
                          { label: '⬆️ Arriba (Rostros)', val: 'center 15%' },
                          { label: '🎯 Centro', val: 'center center' },
                          { label: '⬇️ Abajo (Cuerpo)', val: 'center 85%' },
                        ].map(pos => (
                          <button
                            key={pos.val}
                            type="button"
                            onClick={() => setLocalData(prev => ({ ...prev, couplePhotoPosition: pos.val }))}
                            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                              localData.couplePhotoPosition === pos.val
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-white text-stone-700 hover:bg-purple-50 border border-stone-200'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      onClick={() => coupleFileRef.current?.click()}
                      className="upload-zone py-4 cursor-pointer"
                    >
                      <span className="text-2xl block">💑</span>
                      <span className="text-xs font-bold text-pink-600">
                        Subir foto oficial de los novios
                      </span>
                    </div>
                    <input
                      ref={coupleFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e =>
                        handleFileUpload(e, url => {
                          const updated = { ...localData, mainCouplePhoto: url }
                          setLocalData(updated)
                          handleSave(updated)
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* STORIES TAB */}
              {activeTab === 'stories' && (
                <div className="space-y-6">
                  {/* CREAR HISTORIA */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-xl font-bold text-stone-800 mb-2">
                      Publicar Nueva Historia (Stories)
                    </h4>
                    <p className="text-xs text-stone-500 mb-4">
                      Aparecerá en los círculos superiores tipo Instagram con visor full-screen
                    </p>

                    <form onSubmit={handleAddStory} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Título del Momento
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Sesión en la Playa"
                            value={newStoryTitle}
                            onChange={e => setNewStoryTitle(e.target.value)}
                            className="field-input"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Pie de Foto / Leyenda
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Contando los días para el gran Sí 💕"
                            value={newStoryCaption}
                            onChange={e => setNewStoryCaption(e.target.value)}
                            className="field-input"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Foto del Momento
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="URL de la imagen o sube un archivo"
                            value={newStoryUrl}
                            onChange={e => setNewStoryUrl(e.target.value)}
                            className="field-input flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => storyFileRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs font-bold border border-pink-200 cursor-pointer"
                          >
                            Subir archivo
                          </button>
                        </div>
                        <input
                          ref={storyFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e =>
                            handleFileUpload(e, url => setNewStoryUrl(url))
                          }
                        />
                      </div>

                      <button type="submit" className="btn-gold text-xs py-3 px-6">
                        + Publicar Historia
                      </button>
                    </form>
                  </div>

                  {/* LISTA DE HISTORIAS EXISTENTES */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-lg font-bold text-stone-800 mb-4">
                      Historias Publicadas ({localData.stories.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {localData.stories.map((story, i) => (
                        <div
                          key={story.id || i}
                          className="relative rounded-2xl overflow-hidden border border-stone-200 group bg-stone-900"
                        >
                          <SafeImage
                            src={story.mediaUrl}
                            alt=""
                            className="w-full h-36 object-cover opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 flex flex-col justify-end">
                            <p className="text-white text-xs font-bold truncate">
                              {story.title}
                            </p>
                            <span className="text-[0.65rem] text-white/70 truncate">
                              {story.caption || 'Sin leyenda'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const updated = {
                                ...localData,
                                stories: localData.stories.filter((_, idx) => idx !== i),
                              }
                              setLocalData(updated)
                              handleSave(updated)
                            }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                            title="Eliminar historia"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GESTOR DE VIDEOS TAB */}
              {activeTab === 'videos' && (
                <div className="space-y-6">
                  {/* LOS 2 VIDEOS ESTELARES */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 space-y-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎬</span>
                        <h4 className="font-display text-xl font-bold text-stone-800">
                          Los 2 Videos Estelares de la Boda
                        </h4>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Configura el video de publicidad/invitación y el video documental de su historia de amor
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* VIDEO 1: PUBLICIDAD */}
                      <div className="p-5 rounded-3xl bg-amber-50/50 border border-amber-200/70 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                            1
                          </span>
                          <div>
                            <h5 className="font-bold text-sm text-amber-950">
                              Video 1: Publicidad & Anuncio de Boda
                            </h5>
                            <span className="text-[0.65rem] text-amber-800/80">
                              Tráiler promocional o invitación oficial
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Título del Video
                          </label>
                          <input
                            type="text"
                            value={localData.videos[0]?.title || ''}
                            onChange={e => {
                              const copy = [...localData.videos]
                              if (!copy[0]) {
                                copy[0] = { id: 'v-promo', title: '', url: '', platform: 'youtube', category: 'Publicidad & Anuncio Oficial' }
                              }
                              copy[0] = { ...copy[0], title: e.target.value }
                              setLocalData({ ...localData, videos: copy })
                            }}
                            placeholder="Ej: ✨ Gran Tráiler: Anuncio Oficial de Nuestra Boda"
                            className="field-input text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Enlace de YouTube / Vimeo / MP4
                          </label>
                          <input
                            type="text"
                            value={localData.videos[0]?.url || ''}
                            onChange={e => {
                              const copy = [...localData.videos]
                              if (!copy[0]) {
                                copy[0] = { id: 'v-promo', title: 'Tráiler Oficial', url: '', platform: 'youtube', category: 'Publicidad & Anuncio Oficial' }
                              }
                              copy[0] = { ...copy[0], url: e.target.value }
                              setLocalData({ ...localData, videos: copy, youtubeVideoId: e.target.value })
                            }}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="field-input text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Categoría / Etiqueta
                          </label>
                          <input
                            type="text"
                            value={localData.videos[0]?.category || 'Publicidad & Anuncio Oficial'}
                            onChange={e => {
                              const copy = [...localData.videos]
                              if (copy[0]) {
                                copy[0] = { ...copy[0], category: e.target.value }
                                setLocalData({ ...localData, videos: copy })
                              }
                            }}
                            className="field-input text-xs"
                          />
                        </div>
                      </div>

                      {/* VIDEO 2: HISTORIA DE AMOR */}
                      <div className="p-5 rounded-3xl bg-pink-50/50 border border-pink-200/70 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-pink-500 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                            2
                          </span>
                          <div>
                            <h5 className="font-bold text-sm text-pink-950">
                              Video 2: Historia de Amor
                            </h5>
                            <span className="text-[0.65rem] text-pink-800/80">
                              Momentos románticos y documental
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Título del Video
                          </label>
                          <input
                            type="text"
                            value={localData.videos[1]?.title || ''}
                            onChange={e => {
                              const copy = [...localData.videos]
                              if (!copy[1]) {
                                copy[1] = { id: 'v-love', title: '', url: '', platform: 'youtube', category: 'Historia de Amor & Documental' }
                              }
                              copy[1] = { ...copy[1], title: e.target.value }
                              setLocalData({ ...localData, videos: copy })
                            }}
                            placeholder="Ej: 💕 Nuestra Hermosa Historia de Amor"
                            className="field-input text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Enlace de YouTube / Vimeo / MP4
                          </label>
                          <input
                            type="text"
                            value={localData.videos[1]?.url || ''}
                            onChange={e => {
                              const copy = [...localData.videos]
                              if (!copy[1]) {
                                copy[1] = { id: 'v-love', title: 'Historia de Amor', url: '', platform: 'youtube', category: 'Historia de Amor & Documental' }
                              }
                              copy[1] = { ...copy[1], url: e.target.value }
                              setLocalData({ ...localData, videos: copy })
                            }}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="field-input text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Categoría / Etiqueta
                          </label>
                          <input
                            type="text"
                            value={localData.videos[1]?.category || 'Historia de Amor & Documental'}
                            onChange={e => {
                              const copy = [...localData.videos]
                              if (copy[1]) {
                                copy[1] = { ...copy[1], category: e.target.value }
                                setLocalData({ ...localData, videos: copy })
                              }
                            }}
                            className="field-input text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSave()}
                      className="btn-gold text-xs py-3 px-6 shadow-md"
                    >
                      💾 Guardar Cambios de Videos Estelares
                    </button>
                  </div>

                  {/* AGREGAR VIDEO ADICIONAL */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-lg font-bold text-stone-800 mb-2">
                      + Agregar Otro Video Extra a la Playlist
                    </h4>
                    <p className="text-xs text-stone-500 mb-4">
                      Opcional: puedes añadir más videos de la pedida, fiesta o sesión de fotos
                    </p>

                    <form onSubmit={handleAddVideo} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Título del Video
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Video de la Pedida de Mano"
                            value={newVideoTitle}
                            onChange={e => setNewVideoTitle(e.target.value)}
                            className="field-input"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Categoría
                          </label>
                          <select
                            value={newVideoCat}
                            onChange={e => setNewVideoCat(e.target.value)}
                            className="field-input bg-white cursor-pointer"
                          >
                            <option value="Momentos">Momentos Especiales</option>
                            <option value="Pre-Boda">Sesión Pre-Boda</option>
                            <option value="Propuesta">La Propuesta</option>
                            <option value="Mensaje">Mensaje de los Novios</option>
                            <option value="Fiesta">Celebración</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Enlace o ID de YouTube / Vimeo / MP4
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={newVideoUrl}
                          onChange={e => setNewVideoUrl(e.target.value)}
                          className="field-input font-mono text-xs"
                        />
                      </div>

                      <button type="submit" className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-sm">
                        + Añadir Video Extra
                      </button>
                    </form>
                  </div>

                  {/* LISTA COMPLETA DE VIDEOS */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-lg font-bold text-stone-800 mb-4">
                      Todos los Videos Configurados ({localData.videos.length})
                    </h4>
                    <div className="space-y-3">
                      {localData.videos.map((vid, i) => (
                        <div
                          key={vid.id || i}
                          className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 bg-stone-50 flex-wrap gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl">🎬</span>
                            <div className="min-w-0">
                              <span className="text-[0.65rem] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                                {vid.category || (i === 0 ? 'Publicidad' : i === 1 ? 'Historia' : 'Extra')}
                              </span>
                              <h5 className="font-bold text-sm text-stone-800 truncate mt-1">{vid.title}</h5>
                              <p className="text-xs text-stone-500 truncate max-w-md font-mono">{vid.url}</p>
                            </div>
                          </div>
                          {i > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = {
                                  ...localData,
                                  videos: localData.videos.filter((_, idx) => idx !== i),
                                }
                                setLocalData(updated)
                                handleSave(updated)
                              }}
                              className="px-3 py-1 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                            >
                              Eliminar Extra
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GALERÍA & COLLAGE TAB */}
              {activeTab === 'galeria' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-xl font-bold text-stone-800 mb-2">
                      Agregar Fotos al Collage
                    </h4>
                    <p className="text-xs text-stone-500 mb-4">
                      Sube fotos desde tu computadora o celular, o agrega por enlace
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Categoría en Collage
                        </label>
                        <select
                          value={newPhotoCategory}
                          onChange={e => setNewPhotoCategory(e.target.value as any)}
                          className="field-input bg-white cursor-pointer"
                        >
                          <option value="preboda">Sesión Pre-Boda</option>
                          <option value="historia">Nuestra Historia</option>
                          <option value="civil">Civil & Familia</option>
                          <option value="fiesta">Celebración & Fiesta</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Leyenda o Descripción (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Atardecer en el parque"
                          value={newPhotoCaption}
                          onChange={e => setNewPhotoCaption(e.target.value)}
                          className="field-input"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 items-center flex-wrap">
                      <input
                        type="text"
                        placeholder="Pega la URL de la foto..."
                        value={newPhotoUrl}
                        onChange={e => setNewPhotoUrl(e.target.value)}
                        className="field-input flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="btn-gold text-xs py-3 px-5"
                      >
                        + Agregar por URL
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryFileRef.current?.click()}
                        className="px-4 py-3 rounded-full text-xs font-bold bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 cursor-pointer"
                      >
                        📤 Subir Archivo
                      </button>
                    </div>

                    <input
                      ref={galleryFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e =>
                        handleFileUpload(e, url => {
                          const newPhoto = {
                            id: `photo-${Date.now()}`,
                            url,
                            caption: newPhotoCaption || 'Recuerdo especial',
                            category: newPhotoCategory,
                          }
                          const updated = {
                            ...localData,
                            galleryPhotos: [...localData.galleryPhotos, newPhoto],
                          }
                          setLocalData(updated)
                          handleSave(updated)
                        })
                      }
                    />
                  </div>

                  {/* FOTOS ACTUALES */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-lg font-bold text-stone-800 mb-4">
                      Fotos en el Collage ({localData.galleryPhotos.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {localData.galleryPhotos.map((photo, i) => (
                        <div
                          key={photo.id || i}
                          className="relative group rounded-2xl overflow-hidden border border-stone-200"
                        >
                          <SafeImage
                            src={photo.url}
                            alt=""
                            className="w-full h-28 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center text-white">
                            <span className="text-[0.65rem] font-bold uppercase text-amber-300">
                              {photo.category}
                            </span>
                            <button
                              onClick={() => {
                                const updated = {
                                  ...localData,
                                  galleryPhotos: localData.galleryPhotos.filter((_, idx) => idx !== i),
                                }
                                setLocalData(updated)
                                handleSave(updated)
                              }}
                              className="mt-2 px-2.5 py-1 rounded-full bg-red-600 text-white text-[0.65rem] font-bold"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODERACIÓN FORO TAB */}
              {activeTab === 'foro' && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-xl font-bold text-stone-800">
                        Moderación del Libro de Firmas & Foro
                      </h4>
                      <p className="text-xs text-stone-500">
                        Gestiona los mensajes recibidos de los invitados. Los filtros ya bloquean malas palabras en tiempo real.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                      {localData.guestbook.length} Mensajes
                    </span>
                  </div>

                  <div className="space-y-3">
                    {localData.guestbook.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                          msg.isPinned
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{msg.emoji}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-stone-900">{msg.author}</h5>
                              <span className="text-[0.65rem] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                                {msg.relationship}
                              </span>
                              {msg.isPinned && (
                                <span className="text-[0.65rem] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                  ⭐ Fijado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-700 mt-1 leading-relaxed">{msg.message}</p>
                            <span className="text-[0.65rem] text-stone-400 mt-1 block">
                              {msg.timestamp} · ❤️ {msg.likes} Me gusta
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => onTogglePinMessage(msg.id)}
                            className="px-3 py-1 rounded-full text-xs font-bold bg-white hover:bg-amber-50 text-amber-700 border border-amber-200"
                          >
                            {msg.isPinned ? 'Desfijar' : '⭐ Destacar'}
                          </button>
                          <button
                            onClick={() => onDeleteGuestbookMessage(msg.id)}
                            className="px-3 py-1 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GESTIÓN RSVP TAB */}
              {activeTab === 'rsvp' && (
                <div className="space-y-6">
                  {/* AGREGAR INVITADO */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h4 className="font-display text-xl font-bold text-stone-800">
                        Lista de Invitados & Asistencia ({totalConfirmedGuests} Confirmados)
                      </h4>
                      <button
                        onClick={handleExportRsvpCsv}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-2 cursor-pointer"
                      >
                        📥 Descargar Excel / CSV
                      </button>
                    </div>

                    <form onSubmit={handleAddGuest} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                      <input
                        type="text"
                        required
                        placeholder="Nombre del invitado / familia"
                        value={newGuestName}
                        onChange={e => setNewGuestName(e.target.value)}
                        className="field-input sm:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="Teléfono"
                        value={newGuestPhone}
                        onChange={e => setNewGuestPhone(e.target.value)}
                        className="field-input"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={newGuestCount}
                          onChange={e => setNewGuestCount(Number(e.target.value))}
                          className="field-input w-20"
                          title="Número de pases"
                        />
                        <button type="submit" className="btn-gold text-xs px-4 py-2 flex-1 justify-center">
                          + Registrar
                        </button>
                      </div>
                    </form>

                    {/* BUSCADOR */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="🔍 Buscar invitado por nombre..."
                        value={guestSearch}
                        onChange={e => setGuestSearch(e.target.value)}
                        className="field-input"
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-stone-100/70 uppercase text-stone-500 text-[0.65rem] tracking-wider">
                          <tr>
                            <th className="p-3">Invitado</th>
                            <th className="p-3">Teléfono</th>
                            <th className="p-3">Pases</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {localData.rsvpList
                            .filter(g =>
                              g.name.toLowerCase().includes(guestSearch.toLowerCase())
                            )
                            .map((guest, i) => (
                              <tr key={guest.id || i} className="hover:bg-pink-50/40">
                                <td className="p-3 font-semibold text-stone-900">{guest.name}</td>
                                <td className="p-3">{guest.phone}</td>
                                <td className="p-3 font-bold">{guest.guestsCount}</td>
                                <td className="p-3">
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                    {guest.attendance}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => {
                                      const updated = {
                                        ...localData,
                                        rsvpList: localData.rsvpList.filter((_, idx) => idx !== i),
                                      }
                                      setLocalData(updated)
                                      handleSave(updated)
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CONFIGURACIÓN GENERAL TAB */}
              {activeTab === 'general' && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100">
                    <div>
                      <h4 className="font-display text-xl font-bold text-stone-800">
                        Datos Principales & Logística
                      </h4>
                      <p className="text-xs text-stone-500">
                        Edita los nombres, ceremonias, familia y padrinos de la boda
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('¿Deseas restablecer los datos con la información oficial de la invitación de Luis & Victoria?')) {
                          localStorage.removeItem('wedding_data_luis_victoria_v2')
                          window.location.reload()
                        }
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                    >
                      🔄 Restablecer Datos de Invitación
                    </button>
                  </div>

                  {/* NOVIOS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Nombre del Novio (Corto)
                      </label>
                      <input
                        type="text"
                        value={localData.groomName}
                        onChange={e => setLocalData({ ...localData, groomName: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Nombre de la Novia (Corto)
                      </label>
                      <input
                        type="text"
                        value={localData.brideName}
                        onChange={e => setLocalData({ ...localData, brideName: e.target.value })}
                        className="field-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Nombre Completo del Novio
                      </label>
                      <input
                        type="text"
                        value={localData.groomFullName}
                        onChange={e => setLocalData({ ...localData, groomFullName: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Nombre Completo de la Novia
                      </label>
                      <input
                        type="text"
                        value={localData.brideFullName}
                        onChange={e => setLocalData({ ...localData, brideFullName: e.target.value })}
                        className="field-input"
                      />
                    </div>
                  </div>

                  {/* HIJA & BENDICIÓN */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-purple-800">
                      Hija & Bendición Familiar
                    </h5>
                    <div>
                      <label className="block text-[0.68rem] font-bold text-stone-600 mb-1">
                        Nombre de la Hija
                      </label>
                      <input
                        type="text"
                        value={localData.daughterName || ''}
                        onChange={e => setLocalData({ ...localData, daughterName: e.target.value })}
                        placeholder="Emma Antonela Quispe Choque"
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.68rem] font-bold text-stone-600 mb-1">
                        Frase de Bendición Nupcial
                      </label>
                      <textarea
                        rows={2}
                        value={localData.spiritualBlessing || ''}
                        onChange={e => setLocalData({ ...localData, spiritualBlessing: e.target.value })}
                        className="field-input text-xs"
                      />
                    </div>
                  </div>

                  {/* PADRES */}
                  <div className="p-4 rounded-2xl bg-stone-100/60 border border-stone-200 space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                      Padres de los Novios
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Padre del Novio</label>
                        <input
                          type="text"
                          value={localData.groomFather || ''}
                          onChange={e => setLocalData({ ...localData, groomFather: e.target.value })}
                          className="field-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Madre del Novio</label>
                        <input
                          type="text"
                          value={localData.groomMother || ''}
                          onChange={e => setLocalData({ ...localData, groomMother: e.target.value })}
                          className="field-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Padre de la Novia</label>
                        <input
                          type="text"
                          value={localData.brideFather || ''}
                          onChange={e => setLocalData({ ...localData, brideFather: e.target.value })}
                          className="field-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Madre de la Novia</label>
                        <input
                          type="text"
                          value={localData.brideMother || ''}
                          onChange={e => setLocalData({ ...localData, brideMother: e.target.value })}
                          className="field-input text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PADRINOS */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                      Padrinos de Boda
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Padrino Mayor</label>
                        <input
                          type="text"
                          value={localData.padrinoMayor || ''}
                          onChange={e => setLocalData({ ...localData, padrinoMayor: e.target.value })}
                          className="field-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Madrina Mayor</label>
                        <input
                          type="text"
                          value={localData.madrinaMayor || ''}
                          onChange={e => setLocalData({ ...localData, madrinaMayor: e.target.value })}
                          className="field-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Padrino de Aros</label>
                        <input
                          type="text"
                          value={localData.padrinoAros || ''}
                          onChange={e => setLocalData({ ...localData, padrinoAros: e.target.value })}
                          className="field-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Madrina de Aros</label>
                        <input
                          type="text"
                          value={localData.madrinaAros || ''}
                          onChange={e => setLocalData({ ...localData, madrinaAros: e.target.value })}
                          className="field-input text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FECHA & HASHTAG */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Fecha y Hora de la Boda (ISO)
                      </label>
                      <input
                        type="text"
                        value={localData.weddingDate}
                        onChange={e => setLocalData({ ...localData, weddingDate: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Hashtag Oficial (#LuisYVictoria)
                      </label>
                      <input
                        type="text"
                        value={localData.hashtag}
                        onChange={e => setLocalData({ ...localData, hashtag: e.target.value })}
                        className="field-input"
                      />
                    </div>
                  </div>

                  {/* LUGARES */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                      Lugares & Horarios
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Iglesia / Ceremonia Religiosa</label>
                        <input
                          type="text"
                          value={localData.ceremonyVenue}
                          onChange={e => setLocalData({ ...localData, ceremonyVenue: e.target.value })}
                          className="field-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Hora Ceremonia Religiosa</label>
                        <input
                          type="text"
                          value={localData.ceremonyTime}
                          onChange={e => setLocalData({ ...localData, ceremonyTime: e.target.value })}
                          className="field-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Local Ceremonia Civil</label>
                        <input
                          type="text"
                          value={localData.civilVenue || ''}
                          onChange={e => setLocalData({ ...localData, civilVenue: e.target.value })}
                          className="field-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Hora Ceremonia Civil</label>
                        <input
                          type="text"
                          value={localData.civilTime || ''}
                          onChange={e => setLocalData({ ...localData, civilTime: e.target.value })}
                          className="field-input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Local de Recepción / Fiesta</label>
                        <input
                          type="text"
                          value={localData.receptionVenue}
                          onChange={e => setLocalData({ ...localData, receptionVenue: e.target.value })}
                          className="field-input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[0.65rem] font-bold text-stone-500 mb-0.5">Dirección Recepción</label>
                        <input
                          type="text"
                          value={localData.receptionAddress}
                          onChange={e => setLocalData({ ...localData, receptionAddress: e.target.value })}
                          className="field-input"
                        />
                      </div>

                      {/* ENLACES DE MAPAS INTERACTIVOS */}
                      <div className="md:col-span-2 pt-2 border-t border-amber-200/50 space-y-3">
                        <span className="text-[0.68rem] font-bold text-amber-900 uppercase tracking-wider block">
                          🗺️ Enlaces de Navegación GPS (Google Maps & Waze)
                        </span>

                        <div>
                          <label className="block text-[0.65rem] font-bold text-stone-600 mb-0.5">
                            Link Google Maps: Iglesia / Parroquia Señor de Qoyllority
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={localData.googleMapsUrl}
                              onChange={e => setLocalData({ ...localData, googleMapsUrl: e.target.value })}
                              placeholder="https://maps.app.goo.gl/..."
                              className="field-input text-xs font-mono flex-1"
                            />
                            {localData.googleMapsUrl && (
                              <a
                                href={localData.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1"
                              >
                                Probar ↗
                              </a>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[0.65rem] font-bold text-stone-600 mb-0.5">
                            Link Google Maps: Local &lsquo;El Golazo&rsquo; (Recepción)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={localData.googleMapsReceptionUrl}
                              onChange={e => setLocalData({ ...localData, googleMapsReceptionUrl: e.target.value })}
                              placeholder="https://maps.app.goo.gl/..."
                              className="field-input text-xs font-mono flex-1"
                            />
                            {localData.googleMapsReceptionUrl && (
                              <a
                                href={localData.googleMapsReceptionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1"
                              >
                                Probar ↗
                              </a>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[0.65rem] font-bold text-stone-600 mb-0.5">
                            Link Waze (Opcional)
                          </label>
                          <input
                            type="text"
                            value={localData.wazeUrl || ''}
                            onChange={e => setLocalData({ ...localData, wazeUrl: e.target.value })}
                            placeholder="https://waze.com/ul?..."
                            className="field-input text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LLUVIA DE SOBRES Y PAGOS */}
                  <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-200/60 space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-pink-800">
                      Lluvia de Sobres (Yape, Plin y Cuentas)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Teléfono Yape"
                        value={localData.yapePhone}
                        onChange={e => setLocalData({ ...localData, yapePhone: e.target.value })}
                        className="field-input"
                      />
                      <input
                        type="text"
                        placeholder="Teléfono Plin"
                        value={localData.plinPhone}
                        onChange={e => setLocalData({ ...localData, plinPhone: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Número de Cuenta Bancaria / CCI"
                      value={localData.bankAccount}
                      onChange={e => setLocalData({ ...localData, bankAccount: e.target.value })}
                      className="field-input"
                    />

                    <div>
                      <label className="block text-[0.68rem] font-bold text-stone-600 mb-1">
                        Imagen QR de Yape (Opcional)
                      </label>
                      <button
                        type="button"
                        onClick={() => qrFileRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold hover:bg-stone-50"
                      >
                        Subir foto de QR Yape
                      </button>
                      <input
                        ref={qrFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e =>
                          handleFileUpload(e, url => setLocalData({ ...localData, yapeQrUrl: url }))
                        }
                      />
                    </div>
                  </div>

                  {/* MÚSICA OFICIAL DE LA BODA */}
                  <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎵</span>
                        <div>
                          <h5 className="font-bold text-xs uppercase tracking-wider text-purple-900">
                            Música de Fondo Oficial de la Boda
                          </h5>
                          <span className="text-[0.65rem] text-purple-700">
                            La canción que sonará automáticamente para todos los invitados al entrar a la web
                          </span>
                        </div>
                      </div>
                      <span className="text-[0.68rem] font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                        Canción activa: {localData.musicTitle}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-600 mb-0.5">
                          Título de la Canción
                        </label>
                        <input
                          type="text"
                          value={localData.musicTitle}
                          onChange={e => setLocalData({ ...localData, musicTitle: e.target.value })}
                          placeholder="A Thousand Years"
                          className="field-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-bold text-stone-600 mb-0.5">
                          Artista / Intérprete
                        </label>
                        <input
                          type="text"
                          value={localData.musicArtist}
                          onChange={e => setLocalData({ ...localData, musicArtist: e.target.value })}
                          placeholder="Christina Perri"
                          className="field-input text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[0.65rem] font-bold text-stone-600 mb-0.5">
                        URL del Archivo de Audio (MP3)
                      </label>
                      <input
                        type="text"
                        value={localData.musicUrl}
                        onChange={e => setLocalData({ ...localData, musicUrl: e.target.value })}
                        placeholder="/music/a-thousand-years.mp3 o enlace https://..."
                        className="field-input text-xs font-mono"
                      />
                    </div>

                    {/* PRESETS DE CANCIONES ROMÁNTICAS */}
                    <div>
                      <span className="text-[0.65rem] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                        Canciones Nupciales Recomendadas (1 Clic):
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { title: 'A Thousand Years', artist: 'Christina Perri', url: '/music/a-thousand-years.mp3' },
                          { title: 'Hasta Mi Final', artist: 'Il Divo', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-wedding-114420.mp3' },
                          { title: 'Canon in D (Orquesta Nupcial)', artist: 'Pachelbel', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=canon-in-d-major-romantic-wedding-piano-and-strings-10022.mp3' },
                          { title: 'Amor Eterno Nupcial', artist: 'Sinfonía Romántica', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b093de3f.mp3?filename=wedding-piano-10702.mp3' },
                        ].map((song) => (
                          <button
                            key={song.title}
                            type="button"
                            onClick={() => {
                              setLocalData({
                                ...localData,
                                musicTitle: song.title,
                                musicArtist: song.artist,
                                musicUrl: song.url,
                              })
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              localData.musicUrl === song.url
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white hover:bg-purple-50 text-stone-700 border-stone-200'
                            }`}
                          >
                            🎵 {song.title} · <span className="opacity-75">{song.artist}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="btn-gold w-full justify-center py-4 text-sm font-extrabold shadow-xl"
                  >
                    💾 Guardar Permanentemente Toda la Configuración
                  </button>
                </div>
              )}

              {/* NUBE & RESPALDOS PRO TAB */}
              {activeTab === 'respaldos' && (
                <div className="space-y-6">
                  {/* ESTADO DEL ALMACENAMIENTO PRO */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <h4 className="font-display text-xl font-bold text-stone-800">
                          🛡️ Motor de Persistencia & Almacenamiento PRO
                        </h4>
                        <p className="text-xs text-stone-500">
                          Tus fotos y datos se guardan con tecnología IndexedDB (sin límite de 5 MB) y optimización WebP
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        IndexedDB Activo
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="text-[0.68rem] text-stone-500 uppercase font-bold block">Fotos de Pareja & Banner</span>
                        <p className="text-xl font-bold text-stone-800 mt-1">
                          {(localData.heroBannerUrl ? 1 : 0) + (localData.mainCouplePhoto ? 1 : 0)}
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="text-[0.68rem] text-stone-500 uppercase font-bold block">Historias (Stories)</span>
                        <p className="text-xl font-bold text-purple-700 mt-1">{localData.stories.length}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="text-[0.68rem] text-stone-500 uppercase font-bold block">Fotos en Galería</span>
                        <p className="text-xl font-bold text-rose-600 mt-1">{localData.galleryPhotos.length}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="text-[0.68rem] text-stone-500 uppercase font-bold block">Invitados Registrados</span>
                        <p className="text-xl font-bold text-amber-600 mt-1">{localData.rsvpList.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* COPIAS DE SEGURIDAD (EXPORTAR E IMPORTAR) */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 space-y-4">
                    <h4 className="font-display text-lg font-bold text-stone-800">
                      📦 Copias de Seguridad (Backups de 1 Clic)
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Descarga toda la boda (con fotos, historias, cronograma y confirmaciones) a un archivo en tu computadora. Puedes restaurarlo en cualquier momento o en otro dispositivo.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                      {/* BOTÓN EXPORTAR JSON */}
                      <button
                        type="button"
                        onClick={() => exportToJson(localData)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 transition-all cursor-pointer group"
                      >
                        <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📥</span>
                        <span className="text-xs font-bold text-center">Descargar Backup (.json)</span>
                        <span className="text-[0.65rem] text-purple-700/80 mt-0.5 text-center">Guarda todo en un archivo local</span>
                      </button>

                      {/* BOTÓN RESTAURAR JSON */}
                      <div
                        onClick={() => backupFileRef.current?.click()}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-900 transition-all cursor-pointer group"
                      >
                        <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📤</span>
                        <span className="text-xs font-bold text-center">Restaurar Backup (.json)</span>
                        <span className="text-[0.65rem] text-pink-700/80 mt-0.5 text-center">Cargar archivo de respaldo</span>
                      </div>
                      <input
                        ref={backupFileRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          try {
                            const imported = await importFromJson(file)
                            setLocalData(imported)
                            handleSave(imported)
                            alert(`✅ ¡Copia de seguridad restaurada con éxito para la boda de ${imported.groomName} y ${imported.brideName}!`)
                          } catch (err) {
                            alert('El archivo seleccionado no es un respaldo válido de la boda.')
                          } finally {
                            e.target.value = ''
                          }
                        }}
                      />

                      {/* BOTÓN EXPORTAR CÓDIGO TS */}
                      <button
                        type="button"
                        onClick={() => downloadConfigFile(localData)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition-all cursor-pointer group sm:col-span-2 lg:col-span-1"
                      >
                        <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">👑</span>
                        <span className="text-xs font-bold text-center">Descargar wedding-config.ts</span>
                        <span className="text-[0.65rem] text-amber-800/80 mt-0.5 text-center">Para fijarlo en el código fuente</span>
                      </button>
                    </div>
                  </div>

                  {/* SINCRONIZACIÓN EN LA NUBE PARA INVITADOS */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-display text-lg font-bold text-stone-800">
                          ☁️ Sincronización Remota en la Nube (Para Invitados)
                        </h4>
                        <p className="text-xs text-stone-500">
                          Conecta un servicio de nube o API para que los cambios se transmitan a los celulares de los invitados
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cloudConfig.enabled}
                          onChange={(e) => {
                            const updated = { ...cloudConfig, enabled: e.target.checked }
                            setCloudConfig(updated)
                            saveCloudConfig(updated)
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    {cloudConfig.enabled ? (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                            URL del Endpoint de Nube (API o Supabase)
                          </label>
                          <input
                            type="text"
                            placeholder="https://tu-proyecto.supabase.co/rest/v1/wedding_data"
                            value={cloudConfig.endpointUrl}
                            onChange={(e) => setCloudConfig({ ...cloudConfig, endpointUrl: e.target.value })}
                            className="field-input"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Clave de API / Anon Key (Opcional)
                          </label>
                          <input
                            type="password"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            value={cloudConfig.apiKey || ''}
                            onChange={(e) => setCloudConfig({ ...cloudConfig, apiKey: e.target.value })}
                            className="field-input"
                          />
                        </div>

                        {cloudMsg && (
                          <p className="text-xs font-bold text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                            {cloudMsg}
                          </p>
                        )}

                        <div className="flex gap-2 flex-wrap pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              saveCloudConfig(cloudConfig)
                              setCloudMsg('✅ Configuración de la nube guardada exitosamente.')
                              setTimeout(() => setCloudMsg(''), 3000)
                            }}
                            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer shadow-sm"
                          >
                            Guardar Ajustes de Nube
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              if (!cloudConfig.endpointUrl) {
                                alert('Por favor ingresa primero la URL del endpoint.')
                                return
                              }
                              setCloudMsg('⏳ Conectando y enviando datos a la nube...')
                              try {
                                const res = await fetch(cloudConfig.endpointUrl, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    ...(cloudConfig.apiKey ? { 'apikey': cloudConfig.apiKey, 'Authorization': `Bearer ${cloudConfig.apiKey}` } : {})
                                  },
                                  body: JSON.stringify(localData)
                                })
                                if (res.ok) {
                                  setCloudMsg('✅ ¡Sincronizado a la nube con éxito! Los invitados verán los datos actualizados.')
                                } else {
                                  setCloudMsg(`⚠️ El servidor respondió con estado: ${res.status}`)
                                }
                              } catch (err: any) {
                                setCloudMsg(`❌ Error de conexión: ${err.message || 'No se pudo conectar'}`)
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
                          >
                            ☁️ Sincronizar Ahora a la Nube
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
                        <p className="font-semibold text-stone-800">
                          💡 ¿Cómo funciona sin backend?
                        </p>
                        <p>
                          Si tienes tu boda desplegada en un frontend estático (como Vercel o Netlify), puedes hacer todos tus cambios y luego hacer clic en <strong>&ldquo;Descargar wedding-config.ts&rdquo;</strong>. Reemplazas ese archivo en tu proyecto y listo: tu boda queda fija para todos los invitados sin tener que pagar un servidor.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
