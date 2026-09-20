import { isStaticExport } from './env';
import type { Snapshot } from './types';

/*
 * Insight kontribusi ala OSS Insight — agregasi dari contributionsCollection
 * (GraphQL, butuh GITHUB_TOKEN): total setahun, kontribusi per bulan (12),
 * distribusi hari-dalam-minggu, dan repo paling aktif.
 *
 * Tanpa token / gagal: fallback dari Events API publik (maks ±90 hari) —
 * panel menampilkan catatan jujur soal cakupan datanya.
 */

export interface Contributions {
  total: number;
  /** 12 bulan terakhir (label singkat id-ID + jumlah). */
  months: Array<{ label: string; count: number }>;
  /** Distribusi per hari-dalam-minggu (0=Minggu … 6=Sabtu). */
  byDayOfWeek: number[];
  /** Repo paling aktif (dari events, selalu tersedia). */
  topRepos: Array<{ repo: string; count: number }>;
  /** 'graphql' = penuh 12 bulan; 'events' = fallback ±90 hari. */
  source: 'graphql' | 'events';
}

const QUERY = `query($owner: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $owner) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function monthsEmpty(): Array<{ label: string; count: number }> {
  const out: Array<{ label: string; count: number }> = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ label: BULAN[d.getMonth()], count: 0 });
  }
  return out;
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** Repo paling aktif dari event publik (fallback / pelengkap). */
function topReposFromEvents(snap: Snapshot, limit = 5): Array<{ repo: string; count: number }> {
  const m = new Map<string, number>();
  for (const e of snap.events) m.set(e.repo, (m.get(e.repo) ?? 0) + 1);
  return [...m.entries()]
    .map(([repo, count]) => ({ repo, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Fallback dari events: bulan (3 bln terakhir terisi) + hari-dalam-minggu. */
function fromEvents(snap: Snapshot): Contributions {
  const months = monthsEmpty();
  const now = new Date();
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const byDow = new Array(7).fill(0);
  for (const e of snap.events) {
    const key = monthKey(e.createdAt);
    const idx = months.findIndex((m, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === key;
    });
    if (idx >= 0) months[idx].count += 1;
    byDow[new Date(e.createdAt).getDay()] += 1;
  }
  void nowKey;
  return {
    total: snap.events.length,
    months,
    byDayOfWeek: byDow,
    topRepos: topReposFromEvents(snap),
    source: 'events',
  };
}

export async function getContributions(snap: Snapshot): Promise<Contributions> {
  const token = process.env.GITHUB_TOKEN;
  if (isStaticExport || !token) return fromEvents(snap);

  const now = new Date();
  const from = new Date(now);
  from.setFullYear(from.getFullYear() - 1);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'niumination-dashboard',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { owner: process.env.GITHUB_OWNER ?? 'Niumination', from: from.toISOString(), to: now.toISOString() },
      }),
    // Halaman statis murni: fetch insight ikut force-cache (per-deploy) agar
    // halaman /system TIDAK mewarisi ISR dari fetch ini (pelajaran #418 —
    // revalidate level-fetch diwarisi halaman yang merendernya).
    cache: 'force-cache' as RequestCache,
    });
    if (!res.ok) return fromEvents(snap);
    const json = (await res.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions: number;
              weeks?: Array<{ contributionDays?: Array<{ date: string; contributionCount: number }> }>;
            };
          };
        };
      };
    };
    const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return fromEvents(snap);

    const months = monthsEmpty();
    const byDow = new Array(7).fill(0);
    const nowMs = now.getTime();
    for (const w of cal.weeks ?? []) {
      for (const day of w.contributionDays ?? []) {
        const t = new Date(day.date).getTime();
        if (t > nowMs) continue;
        const key = monthKey(day.date);
        const idx = months.findIndex((m, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === key;
        });
        if (idx >= 0) months[idx].count += day.contributionCount;
        byDow[new Date(day.date).getDay()] += day.contributionCount;
      }
    }
    return {
      total: cal.totalContributions,
      months,
      byDayOfWeek: byDow,
      topRepos: topReposFromEvents(snap),
      source: 'graphql',
    };
  } catch {
    return fromEvents(snap);
  } finally {
    clearTimeout(timer);
  }
}
