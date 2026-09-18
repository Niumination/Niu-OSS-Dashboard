/**
 * Pemeriksa uptime ala Upptime (GitOps) — dijalankan GitHub Actions tiap 15
 * menit (.github/workflows/uptime.yml), hasilnya di-commit ke repo:
 *
 *   data/uptime.json     (riwayat: 30 hari agregat + 24 jam mentah)
 *   lib/uptime-data.ts   (modul yang dibaca halaman /status & /system)
 *
 * Situs yang diperiksa = deployment (repo original dengan homepage, 10
 * terakhir di-push) — sama dengan logika DashboardMetrics.
 *
 * "ok" = respons diterima dengan status < 500 (403/429 bot-protection tetap
 * dianggap terjangkau, konsisten dengan pemeriksaan klien di dashboard).
 *
 * Jalankan manual:  node scripts/uptime-check.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const INTERVAL_MINUTES = 15;
const RECENT_CAP = 96; // 24 jam @ 15 menit
const DAYS_CAP = 30;
const TIMEOUT_MS = 10_000;
const MAX_SITES = 10;

/* --- daftar situs dari snapshot repositori ------------------------------- */
const repos = JSON.parse(readFileSync(join(process.cwd(), 'data', 'repos.json'), 'utf8'));
const sites = repos
  .filter((r) => r.homepage && !r.fork)
  .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
  .slice(0, MAX_SITES)
  .map((r) => ({ repo: r.name, url: r.homepage }));

/* --- muat riwayat lama ---------------------------------------------------- */
const uptimePath = join(process.cwd(), 'data', 'uptime.json');
let prev = null;
if (existsSync(uptimePath)) {
  try {
    prev = JSON.parse(readFileSync(uptimePath, 'utf8'));
  } catch {
    prev = null;
  }
}
const prevByRepo = new Map((prev?.sites ?? []).map((s) => [s.repo, s]));

/* --- pemeriksaan ---------------------------------------------------------- */
async function check(url) {
  const started = performance.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'niumination-uptime/1.0 (+https://niumination.github.io/status)' },
    });
    const ms = Math.round(performance.now() - started);
    return { ms, ok: res.status < 500, status: res.status };
  } catch {
    return { ms: null, ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

const now = new Date();
const today = now.toISOString().slice(0, 10);

const results = await Promise.all(
  sites.map(async (s) => {
    const { ms, ok } = await check(s.url);
    const old = prevByRepo.get(s.repo);
    const recent = [...(old?.recent ?? []), { t: now.toISOString(), ms, ok }];
    while (recent.length > RECENT_CAP) recent.shift();

    const days = [...(old?.days ?? [])];
    const idx = days.findIndex((d) => d.d === today);
    if (idx >= 0) {
      // rata-rata bergerak sederhana untuk ms hari berjalan
      const prevMs = days[idx].ms && ms ? (days[idx].ms * days[idx].n + ms) / (days[idx].n + 1) : (days[idx].ms ?? ms ?? 0);
      days[idx] = {
        d: today,
        n: days[idx].n + 1,
        ok: days[idx].ok + (ok ? 1 : 0),
        ms: Math.round(prevMs),
      };
    } else {
      days.push({ d: today, n: 1, ok: ok ? 1 : 0, ms: ms ?? 0 });
      while (days.length > DAYS_CAP) days.shift();
    }

    console.log(`${ok ? '✔' : '✘'} ${s.repo} (${ms !== null ? `${ms} ms` : 'timeout'}) -> ${s.url}`);
    return { repo: s.repo, url: s.url, days, recent };
  }),
);

const data = {
  updatedAt: now.toISOString(),
  intervalMinutes: INTERVAL_MINUTES,
  sites: results,
};

writeFileSync(uptimePath, JSON.stringify(data, null, 2) + '\n');

const ts = `// AUTO-GENERATED oleh scripts/uptime-check.mjs pada ${now.toISOString()}
// Riwayat uptime GitOps — diperbarui GitHub Actions tiap ${INTERVAL_MINUTES} menit.
// Jangan sunting manual; regenerate: node scripts/uptime-check.mjs
import type { UptimeData } from './types';

export const UPTIME_DATA: UptimeData = ${JSON.stringify(data)};
`;
writeFileSync(join(process.cwd(), 'lib', 'uptime-data.ts'), ts);

console.log(`✔ data/uptime.json + lib/uptime-data.ts (${results.length} situs)`);
