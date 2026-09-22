import type { Snapshot } from './types';

/*
 * /now — data "apa yang sedang dikerjakan" (konvensi halaman /now).
 *
 * Sumber: events publik snapshot (per-deploy). Tanpa server, tanpa ISR —
 * halaman statis murni; penyegaran mengikuti ritme deploy (pelajaran #418:
 * JANGAN tambahkan revalidate di sini).
 *
 * Tanggal diformat saat BUILD (deterministik) — bukan waktu klien — agar
 * hydration selalu cocok.
 */

export interface NowRepo {
  repo: string;
  repoUrl: string;
  /** Jumlah event push 30 hari terakhir. */
  pushes: number;
  /** ISO waktu aktivitas terakhir. */
  lastAt: string;
}

export interface NowDay {
  /** 'YYYY-MM-DD' */
  date: string;
  items: Array<{ repo: string; repoUrl: string; summary: string; type: string }>;
}

export interface NowData {
  focus: NowRepo[];
  timeline: NowDay[];
  updatedAt: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Batas kejadian yang ditampilkan per hari (halaman ringkas, bukan log). */
const PER_DAY = 6;

export function computeNow(snap: Snapshot, now: number = Date.now()): NowData {
  const cutoff = now - 30 * DAY_MS;

  // ── fokus: repo dengan push terbanyak 30 hari terakhir ───────────────
  const byRepo = new Map<string, NowRepo>();
  for (const e of snap.events) {
    if (e.type !== 'PushEvent' || +new Date(e.createdAt) < cutoff) continue;
    const cur = byRepo.get(e.repo);
    if (cur) {
      cur.pushes += 1;
      if (+new Date(e.createdAt) > +new Date(cur.lastAt)) cur.lastAt = e.createdAt;
    } else {
      byRepo.set(e.repo, {
        repo: e.repo,
        repoUrl: e.repoUrl,
        pushes: 1,
        lastAt: e.createdAt,
      });
    }
  }
  const focus = [...byRepo.values()]
    .sort((a, b) => b.pushes - a.pushes || +new Date(b.lastAt) - +new Date(a.lastAt))
    .slice(0, 6);

  // ── linimasa: kejadian terbaru dikelompokkan per hari ────────────────
  const days = new Map<string, NowDay>();
  for (const e of snap.events) {
    const day = e.createdAt.slice(0, 10);
    let d = days.get(day);
    if (!d) {
      d = { date: day, items: [] };
      days.set(day, d);
    }
    if (d.items.length < PER_DAY) {
      d.items.push({ repo: e.repo, repoUrl: e.repoUrl, summary: e.summary, type: e.type });
    }
  }
  const timeline = [...days.values()]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  return { focus, timeline, updatedAt: snap.updatedAt };
}

/** '2026-09-22' -> '22 Sep' (format build-time, id-ID ringkas). */
export function shortDay(day: string): string {
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const [y, m, d] = day.split('-').map(Number);
  if (!y || !m || !d) return day;
  return `${d} ${BULAN[m - 1]}`;
}
