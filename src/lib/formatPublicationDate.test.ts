import { describe, expect, it } from 'vitest';
import { formatPublicationDate } from './formatPublicationDate';

describe('formatPublicationDate', () => {
  it('keeps date-only publication months stable across local timezones', () => {
    expect(formatPublicationDate(new Date('2026-11-01'))).toBe('2026.11');
  });
});
