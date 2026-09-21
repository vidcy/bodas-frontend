export interface StoryItem {
  year: string
  title: string
  description: string
  emoji?: string
}

export interface ScheduleItem {
  time: string
  event: string
  icon: string
  detail?: string
}

export interface Person {
  name: string
  role: string
  photo?: string
}

export interface Artist {
  name: string
  genre: string
  description: string
  photo?: string
  instagramHandle?: string
  setTime?: string
}

export interface GalleryPhoto {
  id: string
  url: string
  caption?: string
  category?: 'todas' | 'historia' | 'preboda' | 'civil' | 'fiesta'
  objectPosition?: string // e.g. 'center top', '50% 20%', 'center center'
}

export interface InteractiveStory {
  id: string
  title: string
  mediaUrl: string
  type: 'image' | 'video'
  caption?: string
  timestamp?: string
  duration?: number
  objectPosition?: string
}

export interface GuestbookMessage {
  id: string
  author: string
  relationship: string
  message: string
  emoji: string
  timestamp: string
  likes: number
  isPinned?: boolean
}

export interface VideoItem {
  id: string
  title: string
  url: string
  platform: 'youtube' | 'vimeo' | 'direct'
  category?: string
  thumbnail?: string
}

export interface Announcement {
  id: string
  active: boolean
  title: string
  message: string
  type: 'info' | 'important' | 'party'
  date?: string
}

export interface RsvpGuest {
  id: string
  name: string
  phone: string
  guestsCount: number
  attendance: 'confirmed' | 'declined'
  dietary?: string
  notes?: string
  timestamp: string
}

export interface WeddingData {
  // BÁSICOS
  groomName: string
  brideName: string
  groomFullName: string
  brideFullName: string
  hashtag: string
  tagline: string
  heroBannerUrl?: string
  heroPhotoPosition?: string // Enfoque de imagen hero
  heroSubtitle?: string
  spiritualBlessing?: string

  // FAMILIA & HIJA
  daughterName?: string
  groomFather?: string
  groomMother?: string
  brideFather?: string
  brideMother?: string

  // PADRINOS
  padrinoMayor?: string
  madrinaMayor?: string
  padrinoAros?: string
  madrinaAros?: string

  // FECHA Y HORA
  weddingDate: string
  ceremonyTime: string
  civilTime?: string
  receptionTime: string

  // LUGARES
  ceremonyVenue: string
  ceremonyAddress: string
  civilVenue?: string
  receptionVenue: string
  receptionAddress: string
  googleMapsUrl: string
  googleMapsReceptionUrl: string
  wazeUrl?: string

  // HISTORIA
  loveStory: StoryItem[]
  coupleDescription: string
  yearsTogther: number

  // PROGRAMA
  schedule: ScheduleItem[]

  // PADRINOS
  groomsmen: Person[]
  bridesmaids: Person[]

  // ARTISTAS
  artists: Artist[]

  // GALERÍA Y FOTOS
  galleryPhotos: GalleryPhoto[]
  mainCouplePhoto: string
  couplePhotoPosition?: string // Enfoque de foto de pareja

  // HISTORIAS INTERACTIVAS (INSTAGRAM-STYLE)
  stories: InteractiveStory[]

  // FORO / LIBRO DE FIRMAS
  guestbook: GuestbookMessage[]

  // VIDEOS
  videos: VideoItem[]
  youtubeVideoId: string
  videoTitle: string

  // COMUNICADOS / AVISOS DE ÚLTIMA HORA
  announcement: Announcement

  // LISTA DE CONFIRMADOS RSVP
  rsvpList: RsvpGuest[]

  // MÚSICA
  musicUrl: string
  musicTitle: string
  musicArtist: string

  // PAGOS / LLUVIA DE SOBRES
  yapePhone: string
  yapeQrUrl: string
  plinPhone: string
  bankAccount: string
  bankName: string
  bankHolder: string

  // RSVP INFO
  rsvpPhone: string
  rsvpDeadline: string
  rsvpWhatsappMessage: string
  maxGuests: number

  // EXTRAS
  dressCode: string
  dressPalette: string[]
  specialNote: string
}
