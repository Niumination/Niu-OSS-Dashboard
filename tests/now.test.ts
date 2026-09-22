import { describe, expect, it } from 'vitest';
import { computeNow, shortDay } from '@/lib/now';
import type { Snapshot, Ghevent } from '@/lib/types';

function ev(repo: string, createdAt: string, type = 'PushEvent'): Ghevent {
  return {
    id: `${repo}-${createdAt}`,
    type,
    repo: `Niumination/${repo}`,
    repoUrl: `https://github.com/Niumination/${repo}`,
    createdAt,
    summary: '3 commits',
  };
}

const NOW = Date.parse('2026-09-22T12:00:00Z');

const snap = {
  events: [
    ev('alpha', '2026-09-21T10:00:00Z'),
    ev('alpha', '2026-09-20T10:00:00Z'),
    ev('alpha', '2026-09-01T10:00:00Z'),
    ev('beta', '2026-09-22T08:00:00Z'),
    ev('beta', '2026-09-22T09:00:00Z'),
    ev('beta', '2026-09-22T10:00:00Z'),
    // di luar 30 hari -> tak masuk fokus (tapi tetap di linimasa)
    ev('gamma-lama', '2026-08-10T10:00:00Z'),
    // non-push -> tak masuk fokus
    ev('watched', '2026-09-22T11:00:00Z', 'WatchEvent'),
  ],
  live: false,
  rateLimited: false,
  updatedAt: '2026-09-22T12:00:00Z',
  source: 'static-build',
} as unknown as Snapshot;

describe('lib/now — computeNow', () => {
  const data = computeNow(snap, NOW);

  it('fokus = hanya PushEvent dalam 30 hari, urut push terbanyak', () => {
    expect(data.focus.map((r) => r.repo)).toEqual([
      'Niumination/beta',
      'Niumination/alpha',
    ]);
  });

  it('fokus membawa jumlah push + waktu terakhir', () => {
    const beta = data.focus[0];
    expect(beta.pushes).toBe(3);
    expect(beta.lastAt).toBe('2026-09-22T10:00:00Z');
  });

  it('linimasa dikelompokkan per hari, terbaru duluan, dibatasi per hari', () => {
    expect(data.timeline[0].date).toBe('2026-09-22');
    // 22 Sep: beta×3 + watched = 4 item (dibawah batas 6)
    expect(data.timeline[0].items).toHaveLength(4);
    // 10 Agu (gamma-lama) tetap masuk linimasa meski di luar jendela fokus
    const aug = data.timeline.find((d) => d.date === '2026-08-10');
    expect(aug?.items).toHaveLength(1);
  });

  it('linimasa maksimal 5 hari', () => {
    expect(data.timeline.length).toBeLessThanOrEqual(5);
  });

  it('shortDay memformat tanggal id-ID ringkas', () => {
    expect(shortDay('2026-09-22')).toBe('22 Sep');
    expect(shortDay('2026-01-05')).toBe('5 Jan');
    // format tak dikenal dikembalikan apa adanya
    expect(shortDay('oops')).toBe('oops');
  });
});
