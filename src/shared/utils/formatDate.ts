/**
 * Formatea una fecha en formato largo boliviano.
 * Ejemplo: formatDate("2025-04-28") → "28 de abril de 2025"
 */
export function formatDate(
  date: string | Date,
  locale: string = 'es-BO',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formatea una fecha con hora.
 * Ejemplo: formatDateTime("2025-04-28T14:30:00") → "28 abr. 2025, 14:30"
 */
export function formatDateTime(
  date: string | Date,
  locale: string = 'es-BO',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Tiempo relativo desde ahora.
 * Ejemplo: timeAgo(pastDate) → "hace 3 horas"
 */
export function timeAgo(date: string | Date, locale: string = 'es-BO'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSeconds < 60) return rtf.format(-diffSeconds, 'second');
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute');
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');
  const diffDays = Math.floor(diffHours / 24);
  return rtf.format(-diffDays, 'day');
}
