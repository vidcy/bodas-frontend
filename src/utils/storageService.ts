import type { WeddingData } from '../types/wedding'

const DB_NAME = 'WeddingAppDB_v1'
const STORE_NAME = 'wedding_store'
const DATA_KEY = 'wedding_data_active'
const LOCAL_STORAGE_KEY = 'wedding_data_luis_victoria_v3'
const CLOUD_CONFIG_KEY = 'wedding_cloud_config'

// URL base del backend de NestJS (configurable mediante .env de Vite)
export const DEFAULT_BACKEND_API =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api'

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
  return { enabled: true, endpointUrl: `${DEFAULT_BACKEND_API}/wedding`, apiKey: '' }
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
 * Obtiene los datos de la boda desde el Backend NestJS + MySQL, con fallback a IndexedDB y LocalStorage
 */
export async function getStoredWeddingData(): Promise<WeddingData | null> {
  const cloud = getCloudConfig()
  const targetUrl = cloud.enabled && cloud.endpointUrl ? cloud.endpointUrl : `${DEFAULT_BACKEND_API}/wedding`

  // 1. Intentar cargar desde el backend NestJS con MySQL
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2s timeout suave

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: cloud.apiKey ? { 'apikey': cloud.apiKey, 'Authorization': `Bearer ${cloud.apiKey}` } : {}
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const backendData = await res.json()
      if (backendData && typeof backendData === 'object') {
        const actualData = Array.isArray(backendData) ? backendData[0] : backendData
        if (actualData && actualData.groomName) {
          console.log('✅ Datos sincronizados exitosamente desde Backend NestJS (MySQL)')
          await saveToIndexedDB(actualData)
          return actualData as WeddingData
        }
      }
    }
  } catch (err) {
    console.info('Aviso: Backend local no detectado o en espera. Usando almacenamiento seguro en IndexedDB:', (err as any).message)
  }

  // 2. Intentar cargar desde IndexedDB (sin límite de 5MB)
  try {
    const localDbData = await getFromIndexedDB()
    if (localDbData) return localDbData
  } catch (err) {
    console.warn('Error leyendo de IndexedDB, intentando localStorage:', err)
  }

  // 3. Fallback a localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed as WeddingData
    }
  } catch (err) {
    console.warn('Error leyendo de localStorage:', err)
  }

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

      request.onsuccess = () => resolve(request.result || null)
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
      const request = store.put(data, DATA_KEY)

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

    const res = await fetch(`${DEFAULT_BACKEND_API}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const json = await res.json()
      if (json && json.url) {
        return json.url as string
      }
    }
  } catch (err) {
    console.info('Backend upload no disponible, se utilizará optimización WebP en cliente.')
  }
  return null
}

/**
 * Guarda los datos de la boda en IndexedDB, localStorage y en el Backend NestJS (MySQL)
 */
export async function saveStoredWeddingData(data: WeddingData): Promise<{ success: boolean; cloudSynced?: boolean; error?: string }> {
  let success = false
  let cloudSynced = false

  // 1. Guardar en IndexedDB (soporta fotos pesadas sin problemas)
  try {
    await saveToIndexedDB(data)
    success = true
  } catch (e) {
    console.error('Error al guardar en IndexedDB:', e)
  }

  // 2. Intentar guardar en localStorage con try/catch seguro
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.info('localStorage cuota alcanzada, datos asegurados en IndexedDB.')
  }

  // 3. Sincronizar con el Backend NestJS / MySQL
  const cloud = getCloudConfig()
  const targetUrl = cloud.enabled && cloud.endpointUrl ? cloud.endpointUrl : `${DEFAULT_BACKEND_API}/wedding`

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cloud.apiKey ? { 'apikey': cloud.apiKey, 'Authorization': `Bearer ${cloud.apiKey}` } : {})
      },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      cloudSynced = true
      console.log('✅ Datos guardados y sincronizados exitosamente en MySQL vía NestJS')
    }
  } catch (err) {
    console.info('Aviso: No se pudo enviar al backend local en este momento, datos protegidos en IndexedDB.')
  }

  return { success, cloudSynced }
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
