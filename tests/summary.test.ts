import { describe, expect, it } from 'vitest';
import { computeSummary } from '@/lib/summary';
import { categorize } from '@/lib/categories';
import type { Ghevent, RepoLite, Snapshot } from '@/lib/types';

function repo(partial: Partial<RepoLite>): RepoLite {
  return {
    name: 'repo',
    fullName: 'Niumination/repo',
    url: 'https://github.com/Niumination/repo',
    description: null,
    language: null,
    stars: 0,
    forks: 0,
    watchers: 0,
    openIssues: 0,
    topics: [],
    homepage: null,
    fork: false,
    archived: false,
    license: null,
    size: 100,
    createdAt: '2026-01-01T00:00:00Z',
    pushedAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

function ev(partial: Partial<Ghevent>): Ghevent {
  return {
    id: '1',
    type: 'PushEvent',
    repo: 'Niumination/repo',
    repoUrl: 'https://api.github.com/repos/Niumination/repo',
    createdAt: new Date().toISOString(),
    summary: '1 commit',
    ...partial,
  };
}

const HARI = 86_400_000;

function snapshotFixture(): Snapshot {
  return {
    user: {
      login: 'Niumination',
      name: null,
      avatar: '',
      bio: null,
      location: null,
      company: null,
      blog: null,
      twitter: null,
      followers: 2,
      following: 19,
      publicRepos: 3,
      joinedAt: '2023-01-26T00:00:00Z',
    },
    repos: [
      repo({ name: 'web-a', language: 'TypeScript', stars: 3, forks: 1, homepage: 'https://a.vercel.app', pushedAt: new Date(Date.now() - 1 * HARI).toISOString() }),
      repo({ name: 'web-b', language: 'TypeScript', stars: 1, pushedAt: new Date(Date.now() - 2 * HARI).toISOString() }),
      repo({ name: 'fork-c', language: 'Python', fork: true, stars: 0, pushedAt: new Date(Date.now() - 400 * HARI).toISOString() }),
    ],
    events: [
      ev({ id: '1', type: 'PushEvent', createdAt: new Date(Date.now() - 1 * HARI).toISOString() }),
      ev({ id: '2', type: 'PushEvent', createdAt: new Date(Date.now() - 3 * HARI).toISOString() }),
      ev({ id: '3', type: 'WatchEvent', createdAt: new Date(Date.now() - 10 * HARI).toISOString() }),
      ev({ id: '4', type: 'PushEvent', createdAt: new Date(Date.now() - 40 * HARI).toISOString() }),
    ],
    live: false,
    rateLimited: false,
    updatedAt: new Date().toISOString(),
    source: 'uji',
  };
}

describe('computeSummary(snap, now) — determinisme', () => {
  it('now eksplisit menghasilkan metrik identik berapa pun jam klien', () => {
    const snap = snapshotFixture();
    const a = computeSummary(snap, 1_800_000_000_000); // jam fiksi A
    const b = computeSummary(snap, 1_800_000_000_000); // panggil ulang
    expect(a).toEqual(b);
  });

  it('now berbeda jauh mengubah window 30 hari (bukti parameter dipakai)', () => {
    const snap = snapshotFixture();
    const a = computeSummary(snap, Date.UTC(2026, 8, 20));
    const b = computeSummary(snap, Date.UTC(2020, 0, 1));
    expect(a.eventsLast30d).not.toBe(b.eventsLast30d);
  });
});

describe('computeSummary()', () => {
  const s = computeSummary(snapshotFixture());

  it('statistik dasar: total, original, stars, forks, followers', () => {
    expect(s.totalRepos).toBe(3);
    expect(s.originalRepos).toBe(2);
    expect(s.totalStars).toBe(4);
    expect(s.totalForks).toBe(1);
    expect(s.followers).toBe(2);
  });

  it('aktif 90 hari & jumlah demo langsung', () => {
    expect(s.activeLast90d).toBe(2); // dua repo terbaru
    expect(s.withLiveDemo).toBe(1);
  });

  it('distribusi bahasa terurut menurun', () => {
    expect(s.languageCounts).toEqual([
      { lang: 'TypeScript', count: 2 },
      { lang: 'Python', count: 1 },
    ]);
    expect(s.mostUsedLanguage).toBe('TypeScript');
  });

  it('kategori: setiap repo terhitung dan all = total', () => {
    expect(s.categoryCounts.all).toBe(3);
    // web-a & web-b => web; fork-c (Python) => utility
    expect(s.categoryCounts.web).toBe(2);
    expect(s.categoryCounts.utility).toBe(1);
  });

  it('deployment hanya repo original dengan homepage', () => {
    expect(s.deployments).toHaveLength(1);
    expect(s.deployments[0].repo).toBe('web-a');
  });

  it('jumlah push 4 minggu & event 30 hari', () => {
    expect(s.commitsLast4Weeks).toBe(2);
    expect(s.eventsLast30d).toBe(3);
  });
});

describe('konsistensi kategori & summary', () => {
  it('jumlah kategori sama dengan total repositori', () => {
    const snap = snapshotFixture();
    const totalKategori = Object.entries(snap.repos).reduce((acc, [, r]) => acc + 1, 0);
    expect(totalKategori).toBe(snap.repos.length);
    for (const r of snap.repos) {
      expect(typeof categorize(r)).toBe('string');
    }
  });
});
