import { useState, useRef } from 'react'
import type {
  WeddingData,
  InteractiveStory,
  VideoItem,
  RsvpGuest
} from '../../types/wedding'

interface AdminPortalProps {
  open: boolean
  onClose: () => void
  data: WeddingData
  onSaveData: (newData: WeddingData) => void
  onDeleteGuestbookMessage: (id: string) => void
  onTogglePinMessage: (id: string) => void
}

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'qazwsx'

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

  // Working copy of data
  const [localData, setLocalData] = useState<WeddingData>(data)
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'comunicados' | 'banners' | 'stories' | 'videos' | 'galeria' | 'foro' | 'rsvp' | 'general'
  >('dashboard')
  const [saveToast, setSaveToast] = useState(false)

  // File upload refs
  const bannerFileRef = useRef<HTMLInputElement>(null)
  const coupleFileRef = useRef<HTMLInputElement>(null)
  const galleryFileRef = useRef<HTMLInputElement>(null)
  const storyFileRef = useRef<HTMLInputElement>(null)
  const qrFileRef = useRef<HTMLInputElement>(null)

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

  if (!open) return null

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('wedding_admin_auth', '1')
      setAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Credenciales incorrectas. Intenta nuevamente.')
      setPass('')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('wedding_admin_auth')
    setAuthenticated(false)
  }

  const handleSave = (customData?: WeddingData) => {
    const toSave = customData || localData
    onSaveData(toSave)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3000)
  }

  // Upload helpers
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64Url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      if (url) callback(url)
    }
    reader.readAsDataURL(file)
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
              className="btn-gold w-full justify-center py-3.5 mt-2"
            >
              Ingresar al Portal
            </button>

            <p className="text-[0.68rem] text-stone-400 text-center mt-2">
              Credenciales predeterminadas: admin / qazwsx
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
              {saveToast && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 animate-bounce">
                  ✅ Cambios guardados
                </span>
              )}
              <button
                onClick={() => handleSave()}
                className="btn-gold text-xs py-2 px-4"
              >
                💾 Guardar Cambios
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
                        <img
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
                          handleFileUpload(e, url =>
                            setLocalData(prev => ({ ...prev, heroBannerUrl: url }))
                          )
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
                        <img
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
                        handleFileUpload(e, url =>
                          setLocalData(prev => ({ ...prev, mainCouplePhoto: url }))
                        )
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
                          <img
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
                  {/* AGREGAR VIDEO */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-xl font-bold text-stone-800 mb-2">
                      Agregar Video a la Sala de Cine
                    </h4>
                    <p className="text-xs text-stone-500 mb-4">
                      Pega cualquier link de YouTube (ej. https://youtube.com/watch?v=...), Vimeo o MP4
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
                            <option value="Tráiler Principal">Tráiler Principal</option>
                            <option value="Historia">Historia de Amor</option>
                            <option value="Pre-Boda">Sesión Pre-Boda</option>
                            <option value="Propuesta">La Propuesta</option>
                            <option value="Mensaje">Mensaje de los Novios</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Enlace o ID de YouTube / Vimeo
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="https://www.youtube.com/watch?v=2Vv-BfVoq4g"
                          value={newVideoUrl}
                          onChange={e => setNewVideoUrl(e.target.value)}
                          className="field-input"
                        />
                      </div>

                      <button type="submit" className="btn-gold text-xs py-3 px-6">
                        + Agregar Video a la Playlist
                      </button>
                    </form>
                  </div>

                  {/* LISTA DE VIDEOS */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <h4 className="font-display text-lg font-bold text-stone-800 mb-4">
                      Videos en la Galería ({localData.videos.length})
                    </h4>
                    <div className="space-y-3">
                      {localData.videos.map((vid, i) => (
                        <div
                          key={vid.id || i}
                          className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 bg-stone-50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🎬</span>
                            <div>
                              <h5 className="font-bold text-sm text-stone-800">{vid.title}</h5>
                              <p className="text-xs text-stone-500 truncate max-w-md">{vid.url}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const updated = {
                                ...localData,
                                videos: localData.videos.filter((_, idx) => idx !== i),
                              }
                              setLocalData(updated)
                              handleSave(updated)
                            }}
                            className="px-3 py-1 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200"
                          >
                            Eliminar
                          </button>
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
                          <img
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

                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="btn-gold w-full justify-center py-4 text-sm font-extrabold shadow-xl"
                  >
                    💾 Guardar Permanentemente Toda la Configuración
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
