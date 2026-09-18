import type { UptimeData, UptimeSite } from './types';

/*
 * Util riwayat uptime (GitOps) — dipakai halaman /status & StatusMonitor.
 * Data: data/uptime.json (regenerasi scripts/uptime-check.mjs via Actions).
 */

/** Persentase uptime N hari terakhir (0–100). */
export function uptimePct(site: UptimeSite, days: number): number {
  const slice = site.days.slice(-days);
  const n = slice.reduce((a, d) => a + d.n, 0);
  const ok = slice.reduce((a, d) => a + d.ok, 0);
  if (n === 0) return 100;
  return (ok / n) * 100;
}

/** Rata-rata waktu respons (ms) N hari terakhir. */
export function avgMs(site: UptimeSite, days: number): number | null {
  const slice = site.days.slice(-days);
  const withMs = slice.filter((d) => d.ms > 0);
  if (withMs.length === 0) return null;
  return Math.round(withMs.reduce((a, d) => a + d.ms, 0) / withMs.length);
}

/** Pemeriksaan terakhir sebuah situs. */
export function lastCheck(site: UptimeSite): { ok: boolean; ms: number | null; t: string } | null {
  const r = site.recent[site.recent.length - 1];
  if (r) return { ok: r.ok, ms: r.ms, t: r.t };
  const d = site.days[site.days.length - 1];
  if (!d) return null;
  return { ok: d.ok >= d.n / 2, ms: d.ms || null, t: d.d };
}

/** Hari terakhir dengan kegagalan (insiden), atau null. */
export function lastIncident(site: UptimeSite): string | null {
  for (let i = site.days.length - 1; i >= 0; i--) {
    if (site.days[i].ok < site.days[i].n) return site.days[i].d;
  }
  return null;
}

/** Ringkasan agregat seluruh situs. */
export function overall(data: UptimeData): {
  sites: number;
  up: number;
  uptime30d: number;
  worst: UptimeSite | null;
} {
  let up = 0;
  let totalChecks = 0;
  let totalOk = 0;
  let worst: UptimeSite | null = null;
  let worstPct = 101;
  for (const s of data.sites) {
    const lc = lastCheck(s);
    if (lc?.ok) up += 1;
    const pct = uptimePct(s, 30);
    totalChecks += s.days.slice(-30).reduce((a, d) => a + d.n, 0);
    totalOk += s.days.slice(-30).reduce((a, d) => a + d.ok, 0);
    if (pct < worstPct) {
      worstPct = pct;
      worst = s;
    }
  }
  return {
    sites: data.sites.length,
    up,
    uptime30d: totalChecks > 0 ? (totalOk / totalChecks) * 100 : 100,
    worst,
  };
}

/** Warna bar harian berdasarkan fraksi ok. */
export function dayColor(frac: number): string {
  if (frac >= 1) return '#3ddc97';
  if (frac >= 0.9) return 'rgba(61,220,151,0.55)';
  if (frac >= 0.5) return '#f5c518';
  return '#ff5d5d';
}
