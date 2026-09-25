import type { WeddingData } from '../types/wedding'

const DB_NAME = 'WeddingAppDB_v1'
const STORE_NAME = 'wedding_store'
const DATA_KEY = 'wedding_data_active'
const LOCAL_STORAGE_KEY = 'wedding_data_luis_victoria_v3'
const CLOUD_CONFIG_KEY = 'wedding_cloud_config'

// Key para guardar URL personalizada del backend en localStorage (configurable desde el Admin)
export const CUSTOM_API_URL_KEY = 'wedding_custom_api_url'

/**
 * Obtiene dinámicamente la URL base de la API del Backend (NestJS).
 * Prioridad:
 * 1. URL personalizada guardada en localStorage (desde el AdminPortal)
 * 2. Variable de entorno VITE_API_URL (inyectada en Vercel o .env)
 * 3. En entorno local (localhost): http://localhost:3000/api
 * 4. En producción (Vercel / dominio externo): fallback a /api del origin
 */
export function getBackendApiUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(CUSTOM_API_URL_KEY)?.trim()
    if (custom) {
      return custom.replace(/\/+$/, '')
    }
  }

  const envUrl = (import.meta as any).env?.VITE_API_URL?.trim()
  if (envUrl) {
    return envUrl.replace(/\/+$/, '')
  }

  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.')
    if (isLocal) {
      return 'http://localhost:3000/api'
    }
    return `${window.location.origin}/api`
  }

  return 'http://localhost:3000/api'
}

export function setCustomBackendApiUrl(url: string): void {
  if (typeof window === 'undefined') return
  const clean = url.trim().replace(/\/+$/, '')
  if (clean) {
    localStorage.setItem(CUSTOM_API_URL_KEY, clean)
  } else {
    localStorage.removeItem(CUSTOM_API_URL_KEY)
  }
}

// Mantener compatibilidad retroactiva
export const DEFAULT_BACKEND_API = getBackendApiUrl()

export const DO_SPACES_CDN_BASE =
  'https://controlfinanzas.nyc3.cdn.digitaloceanspaces.com/bodas'

export const DO_SPACES_ORIGIN_BASE =
  'https://controlfinanzas.nyc3.digitaloceanspaces.com/bodas'

/**
 * Transforma URLs locales o inseguras a la CDN pública y segura con HTTPS de DigitalOcean Spaces.
 * También asegura que ninguna imagen en producción intente cargarse por HTTP inseguro.
 */
export function sanitizeMediaUrl(url?: string | null): string {
  if (!url) return ''
  if (typeof url !== 'string') return ''

  let clean = url.trim()

  // Forzar siempre HTTPS en DigitalOcean Spaces y Cloudinary/CDN
  if (clean.startsWith('http://') && clean.includes('digitaloceanspaces.com')) {
    clean = clean.replace('http://', 'https://')
  }

  // Si la URL apunta a localhost:3000/uploads o a /uploads/boda-
  if (clean.includes('localhost:3000/uploads/') || clean.includes('/uploads/boda-')) {
    const filename = clean.split('/uploads/').pop()
    if (filename) {
      return `${DO_SPACES_CDN_BASE}/${filename}`
    }
  }

  // Si es una ruta relativa que comienza con /uploads/
  if (clean.startsWith('/uploads/')) {
    const filename = clean.replace(/^\/uploads\//, '')
    return `${DO_SPACES_CDN_BASE}/${filename}`
  }

  return clean
}

/**
 * Obtiene la URL alternativa de DigitalOcean Spaces (sin CDN) por si la CDN falla
 */
export function getDirectSpacesUrl(url: string): string {
  if (!url || typeof url !== 'string') return url
  if (url.includes('.cdn.digitaloceanspaces.com')) {
    return url.replace('.cdn.digitaloceanspaces.com', '.digitaloceanspaces.com')
  }
  return url
}

/**
 * Limpia y asegura que todas las fotos de la boda utilicen HTTPS y CDN de Spaces
 */
export function sanitizeWeddingData(data: WeddingData): WeddingData {
  if (!data || typeof data !== 'object') return data

  return {
    ...data,
    heroBannerUrl: sanitizeMediaUrl(data.heroBannerUrl),
    mainCouplePhoto: sanitizeMediaUrl(data.mainCouplePhoto),
    yapeQrUrl: data.yapeQrUrl ? sanitizeMediaUrl(data.yapeQrUrl) : data.yapeQrUrl,
    galleryPhotos: Array.isArray(data.galleryPhotos)
      ? data.galleryPhotos.map((p) => ({
          ...p,
          url: sanitizeMediaUrl(p.url),
        }))
      : data.galleryPhotos,
    stories: Array.isArray(data.stories)
      ? data.stories.map((s) => ({
          ...s,
          mediaUrl: sanitizeMediaUrl(s.mediaUrl),
        }))
      : data.stories,
    videos: Array.isArray(data.videos)
      ? data.videos.map((v) => ({
          ...v,
          thumbnail: v.thumbnail ? sanitizeMediaUrl(v.thumbnail) : v.thumbnail,
        }))
      : data.videos,
  }
}

export interface CloudConfig {
  enabled: boolean
  endpointUrl: string
  apiKey?: string
}

/**
 * Inicializa y devuelve la instancia de IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Obtiene la configuración de la nube guardada
 */
export function getCloudConfig(): CloudConfig {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return { enabled: true, endpointUrl: `${getBackendApiUrl()}/wedding`, apiKey: '' }
}

/**
 * Guarda la configuración de la nube
 */
export function saveCloudConfig(config: CloudConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config))
  } catch (e) {
    console.warn('No se pudo guardar la configuración cloud en localStorage', e)
  }
}

/**
 * Verifica la salud y conectividad con la base de datos MySQL a través del Backend
 */
export async function checkBackendHealth(): Promise<{ ok: boolean; message: string; latencyMs: number; details?: any }> {
  const start = performance.now()
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${getBackendApiUrl()}/wedding/health`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    const latencyMs = Math.round(performance.now() - start)
    if (res.ok) {
      const data = await res.json()
      return { ok: true, message: 'MySQL Conectado', latencyMs, details: data }
    }
    return { ok: false, message: `Error HTTP ${res.status}`, latencyMs }
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start)
    return { ok: false, message: err?.message || 'Servidor Offline', latencyMs }
  }
}

/**
 * Registra una confirmación de asistencia (RSVP) directamente en la base de datos MySQL
 */
export async function submitRsvpToBackend(rsvp: {
  name: string
  phone: string
  guestsCount?: number
  attendance?: 'confirmed' | 'declined'
  dietary?: string
  notes?: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${getBackendApiUrl()}/wedding/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rsvp),
    })
    if (res.ok) {
      const data = await res.json()
      return { success: true, data }
    }
    return { success: false, error: `Error ${res.status}` }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de conexión' }
  }
}

/**
 * Registra un mensaje en el Libro de Firmas directamente en MySQL vía Backend
 */
export async function submitGuestbookMessageToBackend(msg: {
  author: string
  relationship?: string
  message: string
  emoji?: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${getBackendApiUrl()}/wedding/guestbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    })
    if (res.ok) {
      const data = await res.json()
      return { success: true, data }
    }
    return { success: false, error: `Error ${res.status}` }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de conexión' }
  }
}

/**
 * Incrementa un Me Gusta en un mensaje del Libro de Firmas en MySQL
 */
export async function likeGuestbookMessageInBackend(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${getBackendApiUrl()}/wedding/guestbook/${encodeURIComponent(id)}/like`, {
      method: 'POST',
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Elimina un mensaje del Libro de Firmas en MySQL
 */
export async function deleteGuestbookMessageFromBackend(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${getBackendApiUrl()}/wedding/guestbook/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Elimina una confirmación RSVP de MySQL
 */
export async function deleteRsvpFromBackend(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${getBackendApiUrl()}/wedding/rsvp/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Obtiene los datos de la boda directamente desde el Backend NestJS + MySQL
 */
export async function getStoredWeddingData(): Promise<WeddingData | null> {
  const targetUrl = `${getBackendApiUrl()}/wedding`

  try {
    const res = await fetch(targetUrl)
    if (res.ok) {
      const backendData = await res.json()
      if (backendData && typeof backendData === 'object') {
        const actualData = Array.isArray(backendData) ? backendData[0] : backendData
        if (actualData && actualData.groomName) {
          console.log('✅ Datos de boda cargados DIRECTAMENTE desde MySQL vía NestJS')
          // Limpiar caché local obsoleta para que nunca sobrescriba la base de datos
          try {
            localStorage.removeItem(LOCAL_STORAGE_KEY)
          } catch {}
          return sanitizeWeddingData(actualData as WeddingData)
        }
      }
    }
  } catch (err: any) {
    console.warn('Aviso al conectar con MySQL:', err.message)
  }

  // Si el backend no responde, intentar IndexedDB temporalmente
  try {
    const localDbData = await getFromIndexedDB()
    if (localDbData) return sanitizeWeddingData(localDbData)
  } catch {}

  return null
}

/**
 * Lee directamente de IndexedDB
 */
function getFromIndexedDB(): Promise<WeddingData | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(DATA_KEY)

      request.onsuccess = () => {
        const val = request.result || null
        resolve(val ? sanitizeWeddingData(val) : null)
      }
      request.onerror = () => reject(request.error)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Guarda en IndexedDB sin límite de cuota
 */
function saveToIndexedDB(data: WeddingData): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const sanitized = sanitizeWeddingData(data)
      const request = store.put(sanitized, DATA_KEY)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Sube una foto directamente al Backend NestJS si está encendido
 */
export async function uploadPhotoToBackend(file: File | Blob, filename?: string): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', file, filename || (file as File).name || 'foto.webp')

    // 1. Intentar DEFAULT_BACKEND_API/upload
    let res: Response | null = await fetch(`${getBackendApiUrl()}/upload`, {
      method: 'POST',
      body: formData,
    }).catch(() => null)

    // 2. Fallback a proxy /api/upload
    if (!res || !res.ok) {
      res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      }).catch(() => null)
    }

    if (res && res.ok) {
      const json = await res.json()
      if (json && json.url) {
        const safeUrl = sanitizeMediaUrl(json.url as string)
        console.log('✅ Foto subida exitosamente al servidor:', safeUrl)
        return safeUrl
      }
    }
  } catch (err: any) {
    console.warn('Backend upload no disponible:', err.message)
  }
  return null
}

/**
 * Guarda los datos de la boda DIRECTAMENTE en el Backend NestJS y la base de datos MySQL
 */
export async function saveStoredWeddingData(data: WeddingData): Promise<{ success: boolean; cloudSynced?: boolean; error?: string }> {
  let cloudSynced = false
  const sanitizedData = sanitizeWeddingData(data)

  try {
    // 1. Intentar a través de DEFAULT_BACKEND_API/wedding
    let res: Response | null = await fetch(`${getBackendApiUrl()}/wedding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData)
    }).catch(() => null)

    // 2. Fallback a través del proxy local /api/wedding
    if (!res || !res.ok) {
      res = await fetch('/api/wedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData)
      }).catch(() => null)
    }

    if (res && res.ok) {
      cloudSynced = true
      console.log('✅ Datos guardados y sincronizados DIRECTAMENTE en MySQL vía NestJS')
      return { success: true, cloudSynced: true }
    } else {
      console.warn('Backend respondió con status al guardar:', res?.status)
    }
  } catch (err: any) {
    console.error('Error al guardar en el Backend:', err.message)
  }

  // 2. Respaldo secundario en IndexedDB
  try {
    await saveToIndexedDB(data)
  } catch {}

  return { success: cloudSynced, cloudSynced }
}

/**
 * Descarga una copia de seguridad en formato JSON de la boda completa
 */
export function exportToJson(data: WeddingData): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`
  const downloadAnchor = document.createElement('a')
  const dateStr = new Date().toISOString().split('T')[0]
  downloadAnchor.setAttribute('href', jsonString)
  downloadAnchor.setAttribute('download', `boda_${data.groomName}_y_${data.brideName}_backup_${dateStr}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

/**
 * Importa datos desde un archivo JSON local
 */
export function importFromJson(file: File): Promise<WeddingData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text)
        if (!parsed || typeof parsed !== 'object' || !parsed.groomName) {
          throw new Error('El archivo JSON no tiene un formato válido de boda')
        }
        resolve(parsed as WeddingData)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsText(file)
  })
}

/**
 * Genera el código fuente TypeScript listo para reemplazar en `wedding-config.ts`
 */
export function generateWeddingConfigFile(data: WeddingData): string {
  return `import type { WeddingData } from './types/wedding'
export type { WeddingData }

// ── CONFIGURACIÓN OFICIAL DE LA BODA ─────────────────────────────────────────
// Generada automáticamente desde el Panel de Administración PRO
export const DEFAULT_WEDDING: WeddingData = ${JSON.stringify(data, null, 2)}

const STORAGE_KEY = 'wedding_data_luis_victoria_v3'

export function loadWeddingData(): WeddingData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_WEDDING, ...parsed }
    }
  } catch (err) {
    console.warn("Could not load stored wedding data, using defaults", err)
  }
  return DEFAULT_WEDDING
}

export function saveWeddingData(data: WeddingData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.warn("localStorage quota exceeded, ensured in IndexedDB", err)
  }
}
`
}

/**
 * Dispara la descarga del archivo `wedding-config.ts`
 */
export function downloadConfigFile(data: WeddingData): void {
  const content = generateWeddingConfigFile(data)
  const blob = new Blob([content], { type: 'text/typescript;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'wedding-config.ts'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
