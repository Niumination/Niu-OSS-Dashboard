import { describe, expect, it } from 'vitest';
import { avgMs, lastCheck, lastIncident, overall, uptimePct } from '@/lib/uptime';
import type { UptimeData, UptimeSite } from '@/lib/types';

function site(partial: Partial<UptimeSite>): UptimeSite {
  return {
    repo: 'demo',
    url: 'https://demo.example.com',
    days: [],
    recent: [],
    ...partial,
  };
}

function data(sites: UptimeSite[]): UptimeData {
  return { updatedAt: '2026-09-20T00:00:00Z', intervalMinutes: 15, sites };
}

describe('uptimePct()', () => {
  it('100% bila belum ada pemeriksaan', () => {
    expect(uptimePct(site({ days: [{ d: '2026-09-19', n: 0, ok: 0, ms: 0 }] }), 30)).toBe(100);
  });

  it('menghitung proporsi ok/n pada N hari terakhir', () => {
    const s = site({
      days: [
        { d: '2026-09-17', n: 10, ok: 10, ms: 100 },
        { d: '2026-09-18', n: 10, ok: 9, ms: 120 },
        { d: '2026-09-19', n: 10, ok: 8, ms: 150 },
      ],
    });
    // 2 hari terakhir: (9+8)/20 = 85%
    expect(uptimePct(s, 2)).toBeCloseTo(85, 5);
    // Semua hari: 27/30 = 90%
    expect(uptimePct(s, 30)).toBeCloseTo(90, 5);
  });
});

describe('avgMs()', () => {
  it('null bila tidak ada data respons', () => {
    expect(avgMs(site({ days: [{ d: '2026-09-19', n: 4, ok: 4, ms: 0 }] }), 7)).toBeNull();
  });

  it('rata-rata ms hari dengan ms > 0', () => {
    const s = site({
      days: [
        { d: '2026-09-18', n: 4, ok: 4, ms: 100 },
        { d: '2026-09-19', n: 4, ok: 4, ms: 200 },
        { d: '2026-09-20', n: 4, ok: 4, ms: 0 },
      ],
    });
    // (100+200)/2 — hari ms=0 diabaikan
    expect(avgMs(s, 7)).toBe(150);
  });
});

describe('lastCheck()', () => {
  it('mengambil entri recent terbaru', () => {
    const s = site({ recent: [{ t: '2026-09-19T01:00:00Z', ok: true, ms: 90 }, { t: '2026-09-19T02:00:00Z', ok: false, ms: null }] });
    expect(lastCheck(s)).toEqual({ ok: false, ms: null, t: '2026-09-19T02:00:00Z' });
  });

  it('fallback ke hari terakhir bila recent kosong', () => {
    const s = site({ days: [{ d: '2026-09-19', n: 4, ok: 1, ms: 80 }] });
    expect(lastCheck(s)?.ok).toBe(false);
    // Tepat setengah (mayoritas lemah) dihitung OK oleh kontrak >= n/2.
    const half = site({ days: [{ d: '2026-09-19', n: 4, ok: 2, ms: 80 }] });
    expect(lastCheck(half)?.ok).toBe(true);
  });

  it('null bila sama sekali tanpa data', () => {
    expect(lastCheck(site({}))).toBeNull();
  });
});

describe('lastIncident()', () => {
  it('hari terakhir dengan kegagalan, atau null', () => {
    const s = site({
      days: [
        { d: '2026-09-17', n: 4, ok: 3, ms: 80 },
        { d: '2026-09-18', n: 4, ok: 4, ms: 80 },
        { d: '2026-09-19', n: 4, ok: 4, ms: 80 },
      ],
    });
    expect(lastIncident(s)).toBe('2026-09-17');
    expect(lastIncident(site({ days: [{ d: '2026-09-19', n: 4, ok: 4, ms: 80 }] }))).toBeNull();
  });
});

describe('overall()', () => {
  it('agregat situs naik/turun dan uptime gabungan', () => {
    const up = site({
      repo: 'naik',
      days: [{ d: '2026-09-19', n: 10, ok: 10, ms: 90 }],
      recent: [{ t: '2026-09-19T02:00:00Z', ok: true, ms: 90 }],
    });
    const down = site({
      repo: 'turun',
      days: [{ d: '2026-09-19', n: 10, ok: 5, ms: 90 }],
      recent: [{ t: '2026-09-19T02:00:00Z', ok: false, ms: null }],
    });
    const o = overall(data([up, down]));
    expect(o.sites).toBe(2);
    expect(o.up).toBe(1);
    expect(o.uptime30d).toBeCloseTo(75, 5);
  });
});
