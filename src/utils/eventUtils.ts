// src/utils/eventUtils.ts

import { CalendarEvent, Gift } from '../types';

// Person-name matching used for anti-repetition and wishlist lookups.
function samePerson(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

// Returns the gift offered to this person closest to last year's occurrence
// of the event, within a ±45-day window. Used to surface "last year's gift"
// as anti-repetition hint.
export function lastYearGiftForEvent(
  event: CalendarEvent,
  gifts: Gift[]
): Gift | undefined {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastYear = new Date(today.getFullYear() - 1, event.month - 1, event.day);
  const windowMs = 45 * 86_400_000;

  const matches = gifts.filter((g) => {
    if (g.direction !== 'given') return false;
    if ((g.status ?? 'done') !== 'done') return false;
    if (!samePerson(g.giver, event.personName)) return false;
    if (!g.date) return false;
    const t = new Date(g.date + 'T12:00:00').getTime();
    return Math.abs(t - lastYear.getTime()) <= windowMs;
  });

  if (matches.length === 0) return undefined;
  // Closest match to last year's exact day.
  matches.sort((a, b) => {
    const da = Math.abs(new Date(a.date + 'T12:00:00').getTime() - lastYear.getTime());
    const db = Math.abs(new Date(b.date + 'T12:00:00').getTime() - lastYear.getTime());
    return da - db;
  });
  return matches[0];
}

// Returns wishlist ideas tagged for this person.
export function ideasForPerson(personName: string, gifts: Gift[]): Gift[] {
  return gifts.filter(
    (g) => g.status === 'idea' && samePerson(g.giver, personName)
  );
}

export function daysUntilNext(month: number, day: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisYear = today.getFullYear();
  let next = new Date(thisYear, month - 1, day);
  next.setHours(0, 0, 0, 0);
  if (next < today) next = new Date(thisYear + 1, month - 1, day);
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function nextOccurrence(month: number, day: number): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisYear = today.getFullYear();
  let next = new Date(thisYear, month - 1, day);
  if (next < today) next = new Date(thisYear + 1, month - 1, day);
  return next;
}

export function formatEventDate(month: number, day: number): string {
  return new Date(2000, month - 1, day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export function sortEventsByNext(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => daysUntilNext(a.month, a.day) - daysUntilNext(b.month, b.day));
}

export function daysLabel(days: number): string {
  if (days === 0) return "Aujourd'hui ! 🎉";
  if (days === 1) return 'Demain';
  if (days <= 30) return `Dans ${days} jours`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) return `Dans ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  return `Dans ${Math.round(days / 30)} mois`;
}

export const EVENT_TYPES = ['Anniversaire', 'Mariage', 'Naissance', 'Autre'] as const;

export const EVENT_TYPE_CONFIG: Record<string, { emoji: string; color: string }> = {
  Anniversaire: { emoji: '🎂', color: '#E8734A' },
  Mariage: { emoji: '💍', color: '#C48BCE' },
  Naissance: { emoji: '👶', color: '#7B9FE8' },
  Autre: { emoji: '🎉', color: '#F2C94C' },
};

export const REMINDER_OPTIONS = [1, 3, 7, 14];