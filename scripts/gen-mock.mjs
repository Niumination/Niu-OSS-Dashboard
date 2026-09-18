/**
 * Generator snapshot fallback (lib/mock-data.ts).
 *
 * Data fallback BUKAN data acak: ini snapshot nyata akun GitHub yang diambil
 * saat script dijalankan, sehingga saat API rate-limit halaman tetap menampilkan
 * data yang akurat (hanya tanggalnya yang membeku).
 *
 * Jalankan:  npm run gen:mock          (pakai data/*.json lokal jika ada)
 *            npm run gen:mock:fresh    (--fresh: paksa fetch API + perbarui data/*.json)
 * Sumber:    data/*.json lokal (jika ada), jika tidak fetch langsung ke API.
 *
 * --fresh dipakai oleh workflow GitHub Actions mingguan agar snapshot
 * cadangan tidak pernah basi (pola GitOps ala Upptime).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OWNER = process.env.GITHUB_OWNER ?? 'Niumination';
const FRESH = process.argv.includes('--fresh');

function readLocal(name) {
  const p = join(process.cwd(), 'data', name);
  if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'));
  return null;
}

async function gh(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'niumination-gen-mock',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} untuk ${url}`);
  return res.json();
}

const localUser = FRESH ? null : readLocal('user.json');
const localRepos = FRESH ? null : readLocal('repos.json');
const localEvents = FRESH ? null : readLocal('events.json');

let user = localUser;
let repos = localRepos;
let events = localEvents;
let origin = 'data/*.json lokal';

if (!user || !repos) {
  [user, repos] = await Promise.all([
    user ?? gh(`https://api.github.com/users/${OWNER}`),
    repos ?? gh(`https://api.github.com/users/${OWNER}/repos?per_page=100&sort=pushed`),
  ]);
  origin = 'GitHub API (fetch langsung)';
  if (!events) {
    try {
      events = await gh(`https://api.github.com/users/${OWNER}/events/public?per_page=100`);
    } catch {
      events = [];
    }
  }
}
events = events ?? [];

// Mode --fresh: simpan ulang data/*.json agar snapshot lokal ikut segar.
if (FRESH) {
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });
  writeFileSync(join(process.cwd(), 'data', 'user.json'), JSON.stringify(user, null, 2));
  writeFileSync(join(process.cwd(), 'data', 'repos.json'), JSON.stringify(repos, null, 2));
  writeFileSync(join(process.cwd(), 'data', 'events.json'), JSON.stringify(events, null, 2));
  console.log('✔ data/*.json diperbarui dari API');
}

function eventSummary(type, payload) {
  if (type === 'PushEvent') return `${payload?.size?.total ?? 0} commits`;
  if (type === 'CreateEvent') return `membuat ${payload?.ref_type ?? 'repo'} “${payload?.ref ?? ''}”`;
  if (type === 'ReleaseEvent') return `release ${payload?.release?.tag_name ?? payload?.release?.name ?? 'baru'}`;
  if (type === 'ForkEvent') return 'difork';
  if (type === 'WatchEvent') return 'dipantau (watch)';
  if (type === 'IssuesEvent') return 'aktivitas issue';
  if (type === 'PullRequestEvent') return 'aktivitas PR';
  if (type === 'PublicEvent') return 'repo dibuat publik';
  return type.replace('Event', '').toLowerCase();
}

const snapshot = {
  user: {
    login: user.login,
    name: user.name ?? null,
    avatar: user.avatar_url,
    bio: user.bio ?? null,
    location: user.location ?? null,
    company: user.company ?? null,
    blog: user.blog ?? null,
    twitter: user.twitter_username ?? null,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    joinedAt: user.created_at,
  },
  repos: repos.map((r) => ({
    name: r.name,
    fullName: r.full_name,
    url: r.html_url,
    description: r.description ?? null,
    language: r.language ?? null,
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.watchers_count,
    openIssues: r.open_issues_count,
    topics: r.topics ?? [],
    homepage: r.homepage ?? null,
    fork: r.fork,
    archived: r.archived,
    license: r.license?.spdx_id ?? null,
    size: r.size,
    createdAt: r.created_at,
    pushedAt: r.pushed_at,
  })),
  // Catatan: pada Events API, repo.name sudah berupa full_name "owner/repo".
  events: events
    .filter((e) => e.repo && e.repo.name)
    .map((e) => ({
      id: e.id,
      type: e.type,
      repo: e.repo.name,
      repoUrl: e.repo.url,
      createdAt: e.created_at,
      summary: eventSummary(e.type, e.payload),
    })),
  live: false,
  rateLimited: false,
  updatedAt: new Date().toISOString(),
  source: 'fallback-cache',
};

const out = `// AUTO-GENERATED oleh scripts/gen-mock.mjs pada ${new Date().toISOString()}
// Sumber: ${origin}
// Snapshot nyata akun GitHub — dipakai OTOMATIS saat GitHub API rate-limit
// atau saat build static export (GitHub Pages). Regenerasi: npm run gen:mock
import type { Snapshot } from './types';

export const MOCK_SNAPSHOT: Snapshot = ${JSON.stringify(snapshot, null, 2)};
`;

writeFileSync(join(process.cwd(), 'lib', 'mock-data.ts'), out);
console.log(`✔ lib/mock-data.ts ditulis (${snapshot.repos.length} repos, ${snapshot.events.length} events, sumber: ${origin})`);
