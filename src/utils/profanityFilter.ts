// ── FILTRO INTELIGENTE DE MODERACIÓN ANTI-PROFANITY ──────────────────
// Detecta palabras ofensivas, vulgaridades y leetspeak en español e inglés

const BAD_WORDS: string[] = [
  // Español / Jerga Perú y Latinoamérica
  'puta', 'puto', 'mierda', 'carajo', 'verga', 'pendejo', 'pendeja', 'concha',
  'conchasumadre', 'conchatumadre', 'ctm', 'ptm', 'chucha', 'cojudo', 'cojuda',
  'huevon', 'huevona', 'webon', 'webona', 'cabron', 'cabrona', 'maldito',
  'maldita', 'hdp', 'hijodeputa', 'hijo de puta', 'maricon', 'zorra', 'culiao',
  'culia', 'culero', 'perra', 'bastardo', 'estupido', 'estupida', 'idiota',
  'imbecil', 'tarado', 'tarada', 'asno', 'baboso', 'babosa', 'basura',
  'chingar', 'chingada', 'chupala', 'mamalo', 'tetas', 'pene', 'vagina',
  'culo', 'orto', 'porn', 'porno', 'sexo', 'violador', 'violacion', 'desgraciado',
  'coño', 'gilipollas', 'capullo', 'marica', 'sidoso', 'putita', 'puton',

  // Inglés común
  'fuck', 'fucking', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
  'pussy', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'cock', 'motherfucker'
]

// Mapeo leetspeak a caracteres estándar
const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '+': 't',
}

function normalizeText(text: string): string {
  let normalized = text.toLowerCase()

  // Remover tildes y diacríticos
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Reemplazar leetspeak
  let leetCleaned = ''
  for (const char of normalized) {
    leetCleaned += LEET_MAP[char] || char
  }
  normalized = leetCleaned

  // Reducir caracteres repetidos (ej: puuuuutaaa -> puutaa)
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1')

  return normalized
}

export interface ProfanityCheckResult {
  hasProfanity: boolean
  matchedWord?: string
  cleanText?: string
}

export function containsProfanity(text: string): ProfanityCheckResult {
  if (!text || !text.trim()) {
    return { hasProfanity: false }
  }

  const normalized = normalizeText(text)
  // Versión sin ningún espacio ni puntuación para detectar "p.u.t.a" o "p u t a"
  const condensed = normalized.replace(/[^a-z0-9]/g, '')

  for (const badWord of BAD_WORDS) {
    const cleanBadWord = normalizeText(badWord)

    // Coincidencia exacta de palabra delimitada por espacios/puntuación
    const regex = new RegExp(`\\b${cleanBadWord}\\b`, 'i')
    if (regex.test(normalized)) {
      return { hasProfanity: true, matchedWord: badWord }
    }

    // Coincidencia en texto condensado para palabras largas (> 3 letras)
    if (cleanBadWord.length >= 4 && condensed.includes(cleanBadWord)) {
      return { hasProfanity: true, matchedWord: badWord }
    }
  }

  return { hasProfanity: false }
}
