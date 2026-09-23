import type { WeddingData } from '../types/wedding'

/**
 * Genera el enlace directo para agregar el evento a Google Calendar
 */
export function getGoogleCalendarUrl(data: WeddingData): string {
  const title = encodeURIComponent(`Boda de ${data.groomName} & ${data.brideName}`)
  const details = encodeURIComponent(
    `¡Nos Casamos! Matrimonio Religioso y Civil de ${data.groomFullName} y ${data.brideFullName}.\n\n` +
    `Ceremonia: ${data.ceremonyVenue} (${data.ceremonyTime})\n` +
    `Recepción: ${data.receptionVenue} (${data.receptionTime})\n\n` +
    `Hashtag: ${data.hashtag}\n` +
    `Ubicación Maps: ${data.googleMapsUrl}`
  )
  const location = encodeURIComponent(`${data.ceremonyVenue}, ${data.ceremonyAddress}`)

  // 24 de Octubre de 2026: 08:00 AM Perú (UTC-5) -> 13:00 UTC
  // Fin: 25 de Octubre de 2026: 04:00 AM Perú (UTC-5) -> 09:00 UTC
  const startTime = '20261024T130000Z'
  const endTime = '20261025T090000Z'

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`
}

/**
 * Genera y descarga un archivo .ics para Apple Calendar, Outlook o teléfonos móviles
 */
export function downloadIcsCalendar(data: WeddingData): void {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bodas Apps//Invitacion de Boda//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:Boda de ${data.groomName} y ${data.brideName} (${data.hashtag})`,
    `DESCRIPTION:Matrimonio Religioso y Civil de ${data.groomFullName} y ${data.brideFullName}. Ceremonia en ${data.ceremonyVenue} a las ${data.ceremonyTime}. Recepcion en ${data.receptionVenue}.`,
    `LOCATION:${data.ceremonyVenue} - ${data.ceremonyAddress}`,
    'DTSTART:20261024T130000Z',
    'DTEND:20261025T090000Z',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Recordatorio: ¡Manana es la Boda de ${data.groomName} y ${data.brideName}!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `boda_${data.groomName}_y_${data.brideName}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
