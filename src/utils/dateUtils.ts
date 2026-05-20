// src/utils/dateUtils.ts

function parseLocalISODate(isoString: string): Date {
  // For bare YYYY-MM-DD strings, anchor at midday local time to avoid
  // any UTC-shift surprise in toLocaleDateString. Full ISO strings
  // (with time) are passed through to the Date constructor unchanged.
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return new Date(isoString + 'T12:00:00');
  }
  return new Date(isoString);
}

export function formatDate(isoString: string): string {
  return parseLocalISODate(isoString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function toISODateString(date: Date): string {
  // Format in *local* time so the picked day matches what the user
  // selected, regardless of timezone. Using date.toISOString() here
  // would shift any positive-UTC user (Europe/Asia/AU) by one day.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODateString(new Date());
}

export function formatDateShort(isoString: string): string {
  return parseLocalISODate(isoString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
