// src/utils/__tests__/dateUtils.test.ts

import { formatDate, formatDateShort, todayISO, toISODateString } from '../dateUtils';

describe('toISODateString', () => {
  it('formats a local Date as YYYY-MM-DD', () => {
    expect(toISODateString(new Date(2025, 0, 1))).toBe('2025-01-01');
  });

  it('pads single-digit months and days', () => {
    expect(toISODateString(new Date(2025, 2, 5))).toBe('2025-03-05');
    expect(toISODateString(new Date(2025, 11, 9))).toBe('2025-12-09');
  });

  it('does not shift dates across the UTC boundary (regression: B1)', () => {
    // The previous implementation used Date.toISOString(), which converts
    // local midnight to UTC and silently rolled back by 1 day for all
    // positive-offset timezones (Europe/Asia/AU). With the local
    // formatter, the picked day must always survive round-trip.
    const picked = new Date(2025, 0, 1); // midnight local, whatever the host TZ
    expect(toISODateString(picked)).toBe('2025-01-01');
  });
});

describe('todayISO', () => {
  it('matches the host system local calendar day', () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    expect(todayISO()).toBe(`${y}-${m}-${d}`);
  });
});

describe('formatDate / formatDateShort', () => {
  it('renders YYYY-MM-DD strings in French long form', () => {
    const out = formatDate('2025-01-15');
    expect(out).toContain('janvier');
    expect(out).toContain('2025');
    expect(out).toContain('15');
  });

  it('renders the same calendar day for the short form', () => {
    const out = formatDateShort('2025-01-15');
    // dd/mm/yyyy — only the day token matters for this assertion, but we
    // also check the year to guarantee no off-by-one happened.
    expect(out).toMatch(/15/);
    expect(out).toMatch(/2025/);
  });

  it('survives full ISO timestamps with time', () => {
    expect(formatDate('2025-06-15T10:30:00.000Z')).toContain('2025');
  });
});
