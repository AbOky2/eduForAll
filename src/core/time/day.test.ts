import { localDay } from './day';

describe('localDay', () => {
  it('rend le jour local, pas le jour UTC', () => {
    // 23 h 30 UTC, soit 00 h 30 le lendemain à N'Djaména (UTC+1).
    // Le test tourne en Africa/Ndjamena, fixé par la configuration Jest.
    expect(localDay(new Date('2026-05-01T23:30:00.000Z'))).toBe('2026-05-02');
  });

  it('remplit les zéros du mois et du jour', () => {
    expect(localDay(new Date('2026-01-05T12:00:00.000Z'))).toBe('2026-01-05');
  });

  it('suit la fin de mois', () => {
    expect(localDay(new Date('2026-04-30T23:30:00.000Z'))).toBe('2026-05-01');
  });
});
