// src/utils/dateUtils.ts

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function todayISO(): string {
  return toISODateString(new Date());
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
