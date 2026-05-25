// src/utils/__tests__/eventUtils.test.ts

import { CalendarEvent, Gift } from '../../types';
import {
  daysLabel,
  daysUntilNext,
  eventTypeToOccasion,
  ideasForPerson,
  lastYearGiftForEvent,
  samePerson,
  sortEventsByNext,
} from '../eventUtils';

describe('samePerson', () => {
  it('matches identical names', () => {
    expect(samePerson('Alice', 'Alice')).toBe(true);
  });

  it('ignores leading/trailing whitespace', () => {
    expect(samePerson('  Alice ', 'Alice')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(samePerson('alice', 'ALICE')).toBe(true);
  });

  it('does not match different names', () => {
    expect(samePerson('Alice', 'Bob')).toBe(false);
  });
});

describe('eventTypeToOccasion', () => {
  it('maps shared types 1:1', () => {
    expect(eventTypeToOccasion('Anniversaire')).toBe('Anniversaire');
    expect(eventTypeToOccasion('Mariage')).toBe('Mariage');
    expect(eventTypeToOccasion('Naissance')).toBe('Naissance');
  });

  it('collapses Autre', () => {
    expect(eventTypeToOccasion('Autre')).toBe('Autre');
  });
});

describe('daysUntilNext', () => {
  it('returns 0 for today', () => {
    const today = new Date();
    expect(daysUntilNext(today.getMonth() + 1, today.getDate())).toBe(0);
  });

  it('returns a positive count for a future date this year', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    expect(daysUntilNext(tomorrow.getMonth() + 1, tomorrow.getDate())).toBe(1);
  });

  it('rolls a past date forward to next year', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    // Yesterday relative to today should be ~364 days away (or 365 on a
    // leap-year flip). Verify it's a large positive number, not negative.
    const d = daysUntilNext(yesterday.getMonth() + 1, yesterday.getDate());
    expect(d).toBeGreaterThan(300);
  });
});

describe('daysLabel', () => {
  it('uses dedicated wording for today/tomorrow', () => {
    expect(daysLabel(0)).toContain("Aujourd'hui");
    expect(daysLabel(1)).toBe('Demain');
  });

  it('uses days up to a month', () => {
    expect(daysLabel(5)).toBe('Dans 5 jours');
    expect(daysLabel(30)).toBe('Dans 30 jours');
  });

  it('switches to weeks past a month', () => {
    expect(daysLabel(35)).toMatch(/semaine/);
  });

  it('switches to months past about two months', () => {
    expect(daysLabel(120)).toMatch(/mois/);
  });
});

describe('sortEventsByNext', () => {
  it('sorts events by the upcoming occurrence', () => {
    const today = new Date();
    const mkEvent = (month: number, day: number, id: string): CalendarEvent => ({
      id,
      personName: id,
      type: 'Anniversaire',
      month,
      day,
      reminderDays: 7,
      createdAt: '2025-01-01T00:00:00.000Z',
    });
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const inAWeek = new Date(today);
    inAWeek.setDate(today.getDate() + 7);

    const events = [
      mkEvent(inAWeek.getMonth() + 1, inAWeek.getDate(), 'far'),
      mkEvent(tomorrow.getMonth() + 1, tomorrow.getDate(), 'near'),
    ];
    const sorted = sortEventsByNext(events);
    expect(sorted.map((e) => e.id)).toEqual(['near', 'far']);
  });
});

describe('ideasForPerson', () => {
  const baseGift: Gift = {
    id: 'g1',
    imageUri: null,
    name: 'pull',
    giver: 'Alice',
    direction: 'given',
    status: 'idea',
    occasion: 'Anniversaire',
    date: '2025-06-01',
    createdAt: '2025-01-01T00:00:00.000Z',
    category: 'Cadeau',
  };

  it('returns only idea-status gifts for the matching person', () => {
    const gifts: Gift[] = [
      baseGift,
      { ...baseGift, id: 'g2', status: 'done' },
      { ...baseGift, id: 'g3', giver: 'Bob' },
      { ...baseGift, id: 'g4', giver: '  alice  ' }, // same person, whitespace
    ];
    const out = ideasForPerson('Alice', gifts);
    expect(out.map((g) => g.id).sort()).toEqual(['g1', 'g4']);
  });
});

describe('lastYearGiftForEvent', () => {
  it('returns the closest given+done gift within ±45 days of last year', () => {
    const lastYear = new Date().getFullYear() - 1;
    const event: CalendarEvent = {
      id: 'e1',
      personName: 'Alice',
      type: 'Anniversaire',
      month: 6,
      day: 15,
      reminderDays: 7,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    const make = (id: string, date: string, overrides: Partial<Gift> = {}): Gift => ({
      id,
      imageUri: null,
      name: id,
      giver: 'Alice',
      direction: 'given',
      status: 'done',
      occasion: 'Anniversaire',
      date,
      createdAt: '2025-01-01T00:00:00.000Z',
      category: 'Cadeau',
      ...overrides,
    });
    const gifts = [
      make('match', `${lastYear}-06-10`),
      make('outside', `${lastYear}-01-01`),
      make('wrongPerson', `${lastYear}-06-15`, { giver: 'Bob' }),
      make('wrongDirection', `${lastYear}-06-15`, { direction: 'received' }),
    ];
    const out = lastYearGiftForEvent(event, gifts);
    expect(out?.id).toBe('match');
  });

  it('returns undefined when there is no qualifying gift', () => {
    const event: CalendarEvent = {
      id: 'e1',
      personName: 'Solo',
      type: 'Anniversaire',
      month: 6,
      day: 15,
      reminderDays: 7,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    expect(lastYearGiftForEvent(event, [])).toBeUndefined();
  });
});
