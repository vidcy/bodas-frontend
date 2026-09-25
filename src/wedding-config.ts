import type { WeddingData } from './types/wedding'
export type { WeddingData }

import coupleImg from './assets/couple.jpg'
import gallery1 from './assets/gallery1.jpg'
import gallery2 from './assets/gallery2.jpg'
import gallery3 from './assets/gallery3.jpg'
import gallery4 from './assets/gallery4.jpg'

export const DEFAULT_WEDDING: WeddingData = {
  groomName: "Luis",
  brideName: "Victoria",
  groomFullName: "Luis Quispe Pillco",
  brideFullName: "Victoria Choque Baez",
  hashtag: "#LuisYVictoria",
  tagline: "Unidos por el amor, bendecidos por Dios y nuestra hermosa familia",
  heroBannerUrl: "https://controlfinanzas.nyc3.cdn.digitaloceanspaces.com/bodas/boda-20260912-093647-jpg-1-1790354722818-52jbkd.jpeg",
  heroPhotoPosition: "center 30%",
  mainCouplePhoto: "https://controlfinanzas.nyc3.cdn.digitaloceanspaces.com/bodas/boda-whatsapp-image-2026-09-21-at-4-1790213472408-klgyh0.jpeg",
  couplePhotoPosition: "center 20%",

  spiritualBlessing: "Con la bendición de Dios y de nuestros padres. Queremos que estés presente en este día donde complementaremos nuestro amor con un Sí para toda la vida.",

  // FAMILIA & HIJA
  daughterName: "Emma Antonela Quispe Choque",
  groomFather: "Jorge Quispe Quispe",
  groomMother: "Barbara Pillco Ramos",
  brideFather: "Ricardo Choque Carzorla",
  brideMother: "Juliana Baez Baez",

  // PADRINOS
  padrinoMayor: "Jorge Alcca Ramos",
  madrinaMayor: "Maria Pachacutec Baez",
  padrinoAros: "Percy Pachacutec Baez",
  madrinaAros: "Herlinda Baez Tacuri",

  weddingDate: "2026-10-24T08:00:00",
  ceremonyTime: "8:00 A.M.",
  civilTime: "12:00 m.",
  receptionTime: "1:00 P.M.",

  ceremonyVenue: "Parroquia San Vicente de Paúl",
  ceremonyAddress: "Parroquia San Vicente de Paúl (Señor de Qoyllority)",
  civilVenue: "Local El Golazo",
  receptionVenue: "Local 'El Golazo'",
  receptionAddress: "Av. Aeropuerto, Local 'El Golazo'",
  googleMapsUrl: "https://maps.app.goo.gl/C7oAJFYdgV5rAWte7",
  googleMapsReceptionUrl: "https://maps.app.goo.gl/nvWQWm5L1xiXoHED7",
  wazeUrl: "https://waze.com/ul?q=Av+Aeropuerto+El+Golazo",

  loveStory: [
    {
      year: "2019",
      title: "El Primer Encuentro",
      description: "Nuestros caminos se cruzaron en una hermosa tarde de primavera. Una mirada sincera y una conversación que cambiaría nuestras vidas para siempre.",
      emoji: "✨"
    },
    {
      year: "2021",
      title: "Nuestro Amor se Fortalece",
      description: "Aprendimos a caminar de la mano en cada proyecto, superando desafíos, celebrando cada victoria y soñando con un futuro juntos.",
      emoji: "💪"
    },
    {
      year: "2023",
      title: "La Llegada de Emma Antonela",
      description: "El regalo más sublime y sagrado que Dios nos regaló: el nacimiento de nuestra amada hija Emma Antonela, la luz y alegría eterna de nuestras vidas.",
      emoji: "👶"
    },
    {
      year: "2025",
      title: "La Propuesta de Matrimonio",
      description: "Con el corazón rebosante de amor y gratitud hacia la vida, nos prometimos amor eterno. Una respuesta con lágrimas de felicidad: ¡Sí, para siempre!",
      emoji: "💍"
    },
    {
      year: "2026",
      title: "¡El Gran Sí ante Dios y Nuestras Familias!",
      description: "Sábado 24 de Octubre de 2026: Iglesia Señor Qoyllority y Recepción en Local El Golazo. El día soñado en que sellamos nuestro destino.",
      emoji: "🥂"
    }
  ],
  coupleDescription: "Dos almas que complementan su amor con la bendición de Dios, de nuestros queridos padres y de nuestra adorada hija Emma Antonela.",
  yearsTogther: 7,

  schedule: [
    { time: "7:30 A.M.", event: "Llegada de invitados", icon: "🌸", detail: "Bienvenida en el atrio de la Iglesia Señor Qoyllority" },
    { time: "8:00 A.M.", event: "Ceremonia Religiosa", icon: "⛪", detail: "Misa solemne de matrimonio en Iglesia Señor Qoyllority" },
    { time: "9:30 A.M.", event: "Sesión de fotos & Bendición", icon: "📸", detail: "Fotos del recuerdo con familiares, padrinos e invitados" },
    { time: "11:30 A.M.", event: "Traslado al Local El Golazo", icon: "🚗", detail: "Rumbo a la Av. Aeropuerto para la ceremonia civil" },
    { time: "12:00 m.", event: "Matrimonio Civil", icon: "📜", detail: "Ceremonia legal en el Local 'El Golazo'" },
    { time: "1:00 P.M.", event: "Recepción & Brindis de Honor", icon: "🥂", detail: "Almuerzo de gala y primer brindis de los recién casados" },
    { time: "2:30 P.M.", event: "Primer Baile & Vals Familiar", icon: "💃", detail: "Vals con los novios, padrinos y padres" },
    { time: "4:00 P.M.", event: "Orquesta & Artistas en Vivo", icon: "🎤", detail: "Música en vivo, cumbia, huayno y fiesta bailable" },
    { time: "7:00 P.M.", event: "Corte del Pastel & Sorpresas", icon: "🎂", detail: "Momento dulce y recuerdos de bendición" },
  ],

  groomsmen: [
    { name: "Jorge Alcca Ramos", role: "Padrino Mayor", photo: "" },
    { name: "Percy Pachacutec Baez", role: "Padrino de Aros", photo: "" },
  ],
  bridesmaids: [
    { name: "Maria Pachacutec Baez", role: "Madrina Mayor", photo: "" },
    { name: "Herlinda Baez Tacuri", role: "Madrina de Aros", photo: "" },
  ],

  artists: [
    {
      name: "Orquesta Sinfonía del Amor",
      genre: "Valses · Cumbias · Fiesta Bailable",
      description: "Reconocida orquesta con músicos en vivo, vientos y percusión para bailar toda la tarde y noche.",
      photo: "",
      instagramHandle: "@sinfoniadelamor",
      setTime: "4:00 P.M. - 8:00 P.M."
    },
    {
      name: "Mariachi Sol Andino",
      genre: "Mariachi · Serenata Romántica",
      description: "Serenata de gala para Victoria & Luis y sus queridos padrinos y padres.",
      photo: "",
      instagramHandle: "@mariachisolandino",
      setTime: "2:00 P.M."
    },
    {
      name: "DJ & Animación Profesional",
      genre: "Mix Bailable · Hora Loca",
      description: "Iluminación de discoteca y el mejor repertorio para que la pista esté siempre llena.",
      photo: "",
      instagramHandle: "@djboda",
      setTime: "8:00 P.M. en adelante"
    }
  ],

  // HISTORIAS INTERACTIVAS TIPO INSTAGRAM
  stories: [
    {
      id: "story-1",
      title: "Luis & Victoria",
      mediaUrl: coupleImg,
      type: "image",
      caption: "¡Nos casamos! Unidos por el amor y la bendición de Dios 💕",
      timestamp: "Hace 1 hora",
      duration: 5,
      objectPosition: "center 20%"
    },
    {
      id: "story-2",
      title: "Nuestra Emma",
      mediaUrl: gallery1,
      type: "image",
      caption: "Nuestra hijita Emma Antonela, la luz de nuestras vidas 🌸",
      timestamp: "Hace 3 horas",
      duration: 5,
      objectPosition: "center 25%"
    },
    {
      id: "story-3",
      title: "Los Aros",
      mediaUrl: gallery2,
      type: "image",
      caption: "Símbolo de nuestra promesa eterna 💍",
      timestamp: "Ayer",
      duration: 5,
      objectPosition: "center center"
    },
    {
      id: "story-4",
      title: "Familia Unida",
      mediaUrl: gallery3,
      type: "image",
      caption: "Gracias infinitas a nuestros queridos padres y padrinos 🥂",
      timestamp: "Hace 2 días",
      duration: 5,
      objectPosition: "center 20%"
    }
  ],

  // GALERÍA PRO EXCLUSIVA (SIN DUPLICADOS)
  galleryPhotos: [
    { id: "g-1", url: gallery1, caption: "Sesión Pre-Boda Oficial · Miradas de Amor en el Atardecer", category: "preboda", objectPosition: "center 20%" },
    { id: "g-2", url: gallery2, caption: "Nuestros primeros pasos juntos · Siete años de complicidad", category: "historia", objectPosition: "center center" },
    { id: "g-3", url: gallery3, caption: "La bendición de nuestros queridos padres y padrinos de honor", category: "civil", objectPosition: "center 20%" },
    { id: "g-4", url: gallery4, caption: "Nuestra mayor bendición de Dios: nuestra amada Emma Antonela", category: "historia", objectPosition: "center 25%" },
    { id: "g-5", url: coupleImg, caption: "Luis Quispe & Victoria Choque · El Gran Sí para Toda la Vida", category: "preboda", objectPosition: "center 15%" },
  ],

  // VIDEOS ESTELARES DE LA BODA (1: Publicidad/Anuncio, 2: Historia de Amor)
  videos: [
    {
      id: "v-promo",
      title: "✨ Tráiler Oficial: Anuncio & Publicidad de la Boda",
      url: "https://youtu.be/niM_ogm7DYw?si=nlbdygA3UdbfZGyk",
      platform: "youtube",
      category: "Publicidad & Anuncio Oficial",
      thumbnail: ""
    },
    {
      id: "v-love",
      title: "💕 Nuestra Hermosa Historia de Amor (Luis & Victoria)",
      url: "https://www.youtube.com/watch?v=rtOvBOTyX00",
      platform: "youtube",
      category: "Historia de Amor & Documental",
      thumbnail: ""
    }
  ],
  youtubeVideoId: "niM_ogm7DYw",
  videoTitle: "Tráiler Oficial de la Boda",

  // FORO DE MENSAJES CON FILTRO
  guestbook: [
    {
      id: "gb-1",
      author: "Padrinos Jorge & Maria",
      relationship: "Padrinos Mayor 🌟",
      message: "¡Queridos ahijados Luis y Victoria! Que Dios bendiga abundantemente su hogar y a su pequeña Emma. Con orgullo y cariño los acompañaremos en el altar.",
      emoji: "🕊️",
      timestamp: "Hace 2 horas",
      likes: 18,
      isPinned: true
    },
    {
      id: "gb-2",
      author: "Familia Quispe Pillco",
      relationship: "Familia del Novio 🤵",
      message: "Hijo amado, verte formar tu hogar con Victoria nos llena de inmensa dicha. ¡Que vivan los novios!",
      emoji: "🥂",
      timestamp: "Ayer",
      likes: 14,
      isPinned: true
    },
    {
      id: "gb-3",
      author: "Familia Choque Baez",
      relationship: "Familia de la Novia 👰",
      message: "Hija querida, Dios bendiga este nuevo camino junto a Luis y nuestra adorada nieta Emma. Los amamos con toda el alma.",
      emoji: "💍",
      timestamp: "Hace 3 días",
      likes: 16,
      isPinned: true
    }
  ],

  // COMUNICADO DE ÚLTIMA HORA
  announcement: {
    id: "ann-1",
    active: true,
    title: "✨ Aviso para Invitados",
    message: "La Ceremonia Religiosa iniciará puntual a las 8:00 A.M. en la Iglesia Señor Qoyllority. Luego nos trasladaremos al Local 'El Golazo' en Av. Aeropuerto.",
    type: "party",
    date: "24 de Octubre de 2026"
  },

  // LISTA RSVP
  rsvpList: [
    {
      id: "rsvp-1",
      name: "Jorge Alcca Ramos & Maria Pachacutec",
      phone: "+51984000111",
      guestsCount: 2,
      attendance: "confirmed",
      dietary: "Estándar",
      notes: "Padrinos Mayor presentes.",
      timestamp: "2026-09-01 10:00"
    },
    {
      id: "rsvp-2",
      name: "Percy Pachacutec Baez & Herlinda Baez",
      phone: "+51984000222",
      guestsCount: 2,
      attendance: "confirmed",
      dietary: "Estándar",
      notes: "Padrinos de Aros.",
      timestamp: "2026-09-02 11:30"
    }
  ],

  // MÚSICA SELECCIONADA: A THOUSAND YEARS (CHRISTINA PERRI)
  musicUrl: "/music/a-thousand-years.mp3",
  musicTitle: "A Thousand Years",
  musicArtist: "Christina Perri",

  yapePhone: "+51 984 123 456",
  yapeQrUrl: "",
  plinPhone: "+51 984 123 456",
  bankAccount: "BCP: 215-98765432-0-89",
  bankName: "Banco de Crédito del Perú (BCP)",
  bankHolder: "Luis Quispe Pillco & Victoria Choque Baez",

  rsvpPhone: "+51984123456",
  rsvpDeadline: "10 de octubre de 2026",
  rsvpWhatsappMessage: "¡Hola Luis y Victoria! Con mucha alegría confirmo mi asistencia a su Matrimonio Religioso y Civil el 24 de Octubre de 2026 💍🌸",
  maxGuests: 250,

  dressCode: "Elegante / Traje Formal de Gala",
  dressPalette: ["#9B72CF", "#C8B6FF", "#E7C6FF", "#D4AF37", "#6A4C93"],
  specialNote: "Te rogamos reservar los colores blanco y marfil exclusivamente para la novia. Los tonos lila, lavanda, morado suave y dorado son bienvenidos.",
}

import { getStoredWeddingData, saveStoredWeddingData, sanitizeWeddingData } from './utils/storageService'

const CACHE_KEY = 'wedding_data_cached_v1'

function isStaleUrl(url?: string | null): boolean {
  if (!url) return true
  return url.includes('xnxds7') || url.includes('limbw3')
}

export function mergeWithDefaults(parsed: Partial<WeddingData>): WeddingData {
  const heroBannerUrl =
    parsed.heroBannerUrl && !isStaleUrl(parsed.heroBannerUrl)
      ? parsed.heroBannerUrl
      : DEFAULT_WEDDING.heroBannerUrl

  const mainCouplePhoto =
    parsed.mainCouplePhoto && !isStaleUrl(parsed.mainCouplePhoto)
      ? parsed.mainCouplePhoto
      : DEFAULT_WEDDING.mainCouplePhoto

  const merged: WeddingData = {
    ...DEFAULT_WEDDING,
    ...parsed,
    heroBannerUrl,
    mainCouplePhoto,
    youtubeVideoId: parsed.youtubeVideoId || DEFAULT_WEDDING.youtubeVideoId,
    videoTitle: parsed.videoTitle || DEFAULT_WEDDING.videoTitle,
    loveStory: parsed.loveStory?.length ? parsed.loveStory : DEFAULT_WEDDING.loveStory,
    schedule: parsed.schedule?.length ? parsed.schedule : DEFAULT_WEDDING.schedule,
    stories: parsed.stories?.length ? parsed.stories : DEFAULT_WEDDING.stories,
    galleryPhotos: parsed.galleryPhotos?.length ? parsed.galleryPhotos : DEFAULT_WEDDING.galleryPhotos,
    guestbook: parsed.guestbook?.length ? parsed.guestbook : DEFAULT_WEDDING.guestbook,
    videos: parsed.videos?.length ? parsed.videos : DEFAULT_WEDDING.videos,
    announcement: parsed.announcement ? parsed.announcement : DEFAULT_WEDDING.announcement,
    rsvpList: parsed.rsvpList?.length ? parsed.rsvpList : DEFAULT_WEDDING.rsvpList,
  }
  return sanitizeWeddingData(merged)
}

export function loadWeddingData(): WeddingData {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && parsed.groomName) {
          return mergeWithDefaults(parsed)
        }
      }
    }
  } catch {}
  return DEFAULT_WEDDING
}

export async function loadWeddingDataAsync(): Promise<WeddingData> {
  try {
    const asyncData = await getStoredWeddingData()
    if (asyncData) {
      const merged = mergeWithDefaults(asyncData)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(merged))
        }
      } catch {}
      return merged
    }
  } catch (err) {
    console.warn("Aviso consultando base de datos backend:", err)
  }
  return loadWeddingData()
}

export function saveWeddingData(data: WeddingData): void {
  const sanitized = sanitizeWeddingData(data)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(sanitized))
    }
  } catch {}

  // Persiste DIRECTAMENTE en la base de datos MySQL vía Backend NestJS
  saveStoredWeddingData(sanitized).catch(err => {
    console.error("Error al persistir en la base de datos MySQL:", err)
  })
}


