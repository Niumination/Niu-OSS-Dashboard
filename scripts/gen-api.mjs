/**
 * API publik v1 — generator JSON statis (pola GitOps).
 *
 *   node scripts/gen-api.mjs   ->  public/api/v1/*.json
 *
 * Endpoint yang dihasilkan (semuanya JSON, CORS-open di GitHub Pages):
 *   /api/v1/index.json                 — dokumen discovery API
 *   /api/v1/user.json                  — profil ringkas
 *   /api/v1/repos.json                 — daftar repositori (bentuk publik)
 *   /api/v1/repos/{name}.json          — detail satu repositori
 *   /api/v1/events.json                — 100 event publik terakhir
 *   /api/v1/summary.json               — agregat (jumlah, bahasa, topik)
 *   /api/v1/uptime.json                — salinan uptime + uptime% per situs
 *   /api/v1/studies.json               — indeks studi kasus
 *   /api/v1/studies/{slug}.json        — detail satu studi kasus (id + en)
 *
 * Server mode (npm start): app/api/v1/[...resource]/route.ts menyajikan
 * file yang sama — jadi kontrak identik di kedua mode deployment.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * --only <resource> : tulis HANYA file tersebut (dipakai uptime.yml agar
 * cron 15 menit tidak menimpa timestamp 101 file lain → riwayat git bersih).
 * Contoh: node scripts/gen-api.mjs --only uptime
 */
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

const root = process.cwd();
const outDir = join(root, 'public', 'api', 'v1');
const generatedAt = new Date().toISOString();

const readJson = (p) => JSON.parse(readFileSync(join(root, 'data', p), 'utf8'));

// Overlay terjemahan EN untuk deskripsi berbahasa Indonesia.
const descEn = readJson('repo-descriptions.en.json');

const rawRepos = readJson('repos.json');
const events = readJson('events.json');
const user = readJson('user.json');
const uptime = readJson('uptime.json');
const studies = readJson('studies.json');

/* ── repositori: raw GitHub API -> bentuk publik ringkas ────────── */
const repo = (r) => ({
  name: r.name,
  fullName: r.full_name,
  description: r.description,
  descriptionEn: descEn[r.name] ?? null,
  url: r.html_url,
  homepage: r.homepage || null,
  language: r.language || null,
  topics: r.topics ?? [],
  stars: r.stargazers_count ?? 0,
  forks: r.forks_count ?? 0,
  watchers: r.subscribers_count ?? 0,
  openIssues: r.open_issues_count ?? 0,
  fork: r.fork === true,
  archived: r.archived === true,
  license: r.license?.spdx_id ?? null,
  sizeKb: r.size ?? 0,
  createdAt: r.created_at,
  pushedAt: r.pushed_at,
});

const repos = rawRepos
  .map(repo)
  .sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt));

/* ── agregat ringkas ─────────────────────────────────────────────── */
const langCount = new Map();
const topicCount = new Map();
let stars = 0;
let forks = 0;
for (const r of repos) {
  stars += r.stars;
  forks += r.forks;
  if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
  for (const t of r.topics) topicCount.set(t, (topicCount.get(t) ?? 0) + 1);
}
const top = (m, n) =>
  [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, c]) => ({ name: k, count: c }));

const summary = {
  generatedAt,
  totals: {
    repos: repos.length,
    original: repos.filter((r) => !r.fork).length,
    stars,
    forks,
    followers: user.followers ?? null,
    withHomepage: repos.filter((r) => r.homepage).length,
  },
  topLanguages: top(langCount, 10),
  topTopics: top(topicCount, 15),
};

/* ── uptime: salin + uptime% per situs ───────────────────────────── */
const dayRatio = (site, days) => {
  const slice = site.days.slice(-days);
  const n = slice.reduce((s, d) => s + d.n, 0);
  const ok = slice.reduce((s, d) => s + d.ok, 0);
  return n ? Math.round((ok / n) * 10000) / 100 : null;
};
const uptimeApi = {
  generatedAt,
  source: 'data/uptime.json (GitHub Actions, tiap 15 menit)',
  intervalMinutes: uptime.intervalMinutes,
  sites: uptime.sites.map((s) => ({
    repo: s.repo,
    url: s.url,
    uptime7d: dayRatio(s, 7),
    uptime30d: dayRatio(s, 30),
    avgMs30d: (() => {
      const slice = s.days.slice(-30).filter((d) => d.ms);
      if (!slice.length) return null;
      return Math.round(slice.reduce((x, d) => x + d.ms, 0) / slice.length);
    })(),
    days: s.days.length,
    lastOk: s.recent?.find((c) => c.ok)?.ok ?? null,
    lastCheck: s.recent?.[0] ?? null,
  })),
};

/* ── events: 100 terakhir ────────────────────────────────────────── */
const eventsApi = {
  generatedAt,
  count: Math.min(events.length, 100),
  events: events.slice(0, 100).map((e) => ({
    id: e.id,
    type: e.type,
    repo: e.repo,
    summary: e.summary,
    createdAt: e.createdAt,
  })),
};

/* ── user: profil publik ─────────────────────────────────────────── */
const userApi = {
  generatedAt,
  login: user.login,
  name: user.name ?? null,
  avatar: user.avatar,
  bio: user.bio ?? null,
  location: user.location ?? null,
  followers: user.followers ?? null,
  following: user.following ?? null,
  publicRepos: user.publicRepos ?? null,
  joinedAt: user.joinedAt,
};

/* ── studi kasus ─────────────────────────────────────────────────── */
const studyIndex = studies.map((c) => ({
  slug: c.slug,
  title: c.title,
  tagline: c.tagline,
  kind: c.kind,
  year: c.year,
  repo: c.repo,
  demo: c.demo ?? null,
  stack: c.stack,
  accent: c.accent,
  availableLocales: c.en ? ['id', 'en'] : ['id'],
}));

/* ── dokumen discovery ───────────────────────────────────────────── */
const API_BASE = '/api/v1';
const index = {
  name: 'Niumination OSS API',
  version: '1.0.0',
  generatedAt,
  description:
    'API publik read-only untuk repositori, aktivitas, uptime, dan studi kasus Niumination. Statis (GitOps) — di-regenerasi bersama snapshot data; tanpa rate limit.',
  docs: 'https://github.com/Niumination/niumination#-api-publik-v1',
  license: 'CC-BY-4.0 (data), kode MIT',
  endpoints: [
    { path: `${API_BASE}/index.json`, description: 'Dokumen discovery API / API discovery document' },
    { path: `${API_BASE}/user.json`, description: 'Profil GitHub publik / Public GitHub profile' },
    { path: `${API_BASE}/repos.json`, description: 'Daftar repositori (diurut push terbaru)' },
    { path: `${API_BASE}/repos/{name}.json`, description: 'Detail satu repositori' },
    { path: `${API_BASE}/events.json`, description: '100 event publik terakhir' },
    { path: `${API_BASE}/summary.json`, description: 'Agregat statistik' },
    { path: `${API_BASE}/uptime.json`, description: 'Uptime deployment per situs' },
    { path: `${API_BASE}/studies.json`, description: 'Indeks studi kasus' },
    { path: `${API_BASE}/studies/{slug}.json`, description: 'Detail studi kasus (id + en)' },
  ],
};

/* ── tulis ───────────────────────────────────────────────────────── */
mkdirSync(join(outDir, 'repos'), { recursive: true });
mkdirSync(join(outDir, 'studies'), { recursive: true });

const write = (rel, data) => {
  if (ONLY && rel !== `${ONLY}.json`) return; // mode --only: lewati file lain
  writeFileSync(join(outDir, rel), JSON.stringify(data, null, 1) + '\n');
  console.log(`✔ public/api/v1/${rel}`);
};

write('index.json', index);
write('user.json', userApi);
write('repos.json', { generatedAt, count: repos.length, repos });
write('events.json', eventsApi);
write('summary.json', summary);
write('uptime.json', uptimeApi);
write('studies.json', { generatedAt, count: studyIndex.length, studies: studyIndex });
for (const r of repos) {
  if (!ONLY || ONLY === 'repos') write(join('repos', `${r.name}.json`), { generatedAt, repo: r });
}
for (const c of studies) {
  if (!ONLY || ONLY === 'studies') write(join('studies', `${c.slug}.json`), { generatedAt, study: c });
}

console.log(`\nSelesai: ${repos.length + studies.length + 7} file JSON di public/api/v1/`);
