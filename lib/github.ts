import { isStaticExport } from './env';
import { MOCK_SNAPSHOT } from './mock-data';
import type { Ghevent, RepoLite, Snapshot, UserLite } from './types';

/**
 * ============================================================================
 *  GitHub API aggregator
 * ----------------------------------------------------------------------------
 *  Strategi:
 *   1. Data LIVE diambil dari GitHub REST API (v2022-11-28) melalui
 *      `fetch` bawaan Next.js dengan `next.revalidate` (ISR, default 300 dtk)
 *      — cache di-handling platform (Vercel) tanpa konfigurasi tambahan.
 *   2. Jika `GITHUB_TOKEN` di-set, limit naik dari 60 -> 5000 req/jam.
 *   3. Rate limit (403/429) ATAU network error -> otomatis jatuh ke
 *      SNAPSHOT FALLBACK (lib/mock-data.ts, snapshot nyata data) sehingga
 *      halaman TIDAK PERNAH runtuh. UI menampilkan badge "offline/fallback".
 *   4. Mode static export (GitHub Pages) langsung memakai snapshot build.
 * ============================================================================
 */

const OWNER = process.env.GITHUB_OWNER?.trim() || 'Niumination';
const API = 'https://api.github.com';
const REVALIDATE = 300; // 5 menit (ISR)
/** Timeout per-request —防止 ISR rebuild menggantung saat jaringan lambat. */
const FETCH_TIMEOUT_MS = 10_000;

export class GithubError extends Error {
  status: number;
  rateLimited: boolean;
  retryAfterSec: number | null;

  constructor(message: string, status: number, rateLimited: boolean, retryAfterSec: number | null) {
    super(message);
    this.name = 'GithubError';
    this.status = status;
    this.rateLimited = rateLimited;
    this.retryAfterSec = retryAfterSec;
  }
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'niumination-dashboard',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function gh<T>(path: string, opts: { live?: boolean } = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      headers: headers(),
      signal: ctrl.signal,
      // live (route API): ISR revalidate. Statis (render halaman): force-cache
      // supaya halaman statik murni — revalidate level fetch akan diwarisi
      // halaman sebagai ISR dan memicu hydration mismatch (lihat CHANGELOG
      // [Stack 2026.1]).
      ...(opts.live
        ? { next: { revalidate: REVALIDATE, tags: ['github-live'] } }
        : { cache: 'force-cache' as RequestCache }),
    });
  } catch {
    // AbortError (timeout) atau network failure -> fallback snapshot.
    throw new GithubError(`Timeout/network error saat memanggil ${path}`, 0, false, null);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    const reset = res.headers.get('x-ratelimit-reset');
    const retryAfter = reset ? Math.max(0, (Number(reset) - Date.now() / 1000) / 60) : null;
    const isRate = res.status === 403 || res.status === 429;
    const rateLimited = isRate && (remaining === '0' || res.status === 429);
    const msg = rateLimited
      ? `GitHub API rate limit tercapai (reset ± ${Math.ceil(retryAfter ?? 0)} mnt)`
      : `GitHub API error ${res.status} untuk ${path}`;
    throw new GithubError(msg, res.status, rateLimited, retryAfter);
  }
  return (await res.json()) as T;
}

/* ----------------------------- mappers ---------------------------------- */

interface RawRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  topics?: string[];
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  license: { spdx_id: string | null } | null;
  size: number;
  created_at: string;
  pushed_at: string;
}

function mapRepo(r: RawRepo): RepoLite {
  return {
    name: r.name,
    fullName: r.full_name,
    url: r.html_url,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.watchers_count,
    openIssues: r.open_issues_count,
    topics: r.topics ?? [],
    homepage: r.homepage,
    fork: r.fork,
    archived: r.archived,
    license: r.license?.spdx_id ?? null,
    size: r.size,
    createdAt: r.created_at,
    pushedAt: r.pushed_at,
  };
}

interface RawUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

function mapUser(u: RawUser): UserLite {
  return {
    login: u.login,
    name: u.name,
    avatar: u.avatar_url,
    bio: u.bio,
    location: u.location,
    company: u.company,
    blog: u.blog,
    twitter: u.twitter_username,
    followers: u.followers,
    following: u.following,
    publicRepos: u.public_repos,
    joinedAt: u.created_at,
  };
}

interface RawEvent {
  id: string;
  type: string;
  /** null pada event tanpa repo (mis. EmitEvent). `name` = full_name "owner/repo". */
  repo: { name: string; url: string } | null;
  created_at: string;
  payload?: Record<string, unknown>;
}

function eventSummary(type: string, payload: Record<string, unknown> | undefined): string {
  if (type === 'PushEvent') {
    const size = (payload?.size as { total?: number } | undefined)?.total ?? 0;
    return `${size} commit`;
  }
  if (type === 'CreateEvent') {
    const ref = payload?.ref ?? '';
    const kind = (payload?.ref_type as string) ?? 'repo';
    return `membuat ${kind} “${ref}”`;
  }
  if (type === 'ReleaseEvent') {
    const name = (payload?.release as { name?: string; tag_name?: string } | undefined);
    return `rilis ${name?.tag_name ?? name?.name ?? 'baru'}`;
  }
  if (type === 'DeleteEvent') {
    const ref = (payload?.ref as string) ?? '';
    return `menghapus ${ref || 'referensi'}`;
  }
  if (type === 'ForkEvent') return 'difork';
  if (type === 'WatchEvent') return 'dipantau (watch)';
  if (type === 'IssuesEvent') return 'aktivitas issue';
  if (type === 'PullRequestEvent') return 'aktivitas PR';
  if (type === 'PublicEvent') return 'repo dibuat publik';
  return type.replace('Event', '').toLowerCase();
}

/**
 * Catatan: pada Events API, `repo.name` sudah berupa `full_name`
 * ("owner/repo") — bukan nama pendek.
 */
function mapEvent(e: RawEvent): Ghevent | null {
  if (!e.repo?.name) return null;
  return {
    id: e.id,
    type: e.type,
    repo: e.repo.name,
    repoUrl: e.repo.url,
    createdAt: e.created_at,
    summary: eventSummary(e.type, e.payload),
  };
}

/* ------------------------------- rilis ----------------------------------- */

export interface ReleaseItem {
  repo: string;
  tagName: string;
  name: string;
  url: string;
  createdAt: string;
}

const RELEASES_QUERY = `query($owner: String!) {
  user(login: $owner) {
    repositories(first: 60, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        name
        releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes { tagName name createdAt url }
        }
      }
    }
  }
}`;

/**
 * Rilisan terbaru lintas repositori (untuk beranda + RSS).
 * 1 request GraphQL (butuh GITHUB_TOKEN) — bukan 91 request REST.
 * Tanpa token / gagal: fallback ke event ReleaseEvent pada snapshot.
 */
export async function getRecentReleases(snap: Snapshot): Promise<ReleaseItem[]> {
  const fromEvents = (): ReleaseItem[] =>
    snap.events
      .filter((e) => e.type === 'ReleaseEvent')
      .map((e) => ({
        repo: e.repo,
        tagName: '',
        name: e.summary,
        url: `https://github.com/${e.repo}/releases`,
        createdAt: e.createdAt,
      }));

  if (isStaticExport) return fromEvents();

  const token = process.env.GITHUB_TOKEN;
  if (!token) return fromEvents();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'niumination-dashboard',
      },
      body: JSON.stringify({ query: RELEASES_QUERY, variables: { owner: OWNER } }),
      // Halaman statik murni: beku saat build (lihat getGithubSnapshot).
      cache: 'force-cache',
    });
    if (!res.ok) return fromEvents();
    const json = (await res.json()) as {
      data?: {
        user?: {
          repositories?: {
            nodes?: Array<{
              name: string;
              releases?: { nodes?: Array<{ tagName: string; name: string; createdAt: string; url: string }> };
            }>;
          };
        };
      };
    };
    const items: ReleaseItem[] = (json.data?.user?.repositories?.nodes ?? []).flatMap((r) =>
      (r.releases?.nodes ?? []).map((rel) => ({
        repo: r.name,
        tagName: rel.tagName,
        name: rel.name || rel.tagName,
        url: rel.url,
        createdAt: rel.createdAt,
      })),
    );
    return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8);
  } catch {
    return fromEvents();
  } finally {
    clearTimeout(timer);
  }
}

/* ----------------------------- public API -------------------------------- */

export interface SnapshotResult {
  snapshot: Snapshot;
  error: string | null;
}

/**
 * Ambil snapshot lengkap (user + repos + events) dengan fallback otomatis.
 *
 * `live: true`  — dipakai route API `/api/github/*`: fetch ISR (revalidate
 *                 5 mnt), data selalu bergerak; tidak dihidrasi, aman.
 * `live: false` — default untuk RENDER HALAMAN: fetch sekali saat build
 *                 (force-cache) sehingga setiap halaman statik murni dan
 *                 dokumen HTML + flight RSC selalu dari satu render —
 *                 mencegah hydration mismatch React #418 di Vercel
 *                 (ISR pernah mencampur DOM generasi baru dengan payload
 *                 flight generasi lama). Data halaman diperbarui per deploy.
 */
export async function getGithubSnapshot(opts: { live?: boolean } = {}): Promise<Snapshot> {
  // Mode static export (GitHub Pages): snapshot build, tanpa fetch apa pun.
  if (isStaticExport) {
    return { ...MOCK_SNAPSHOT, source: 'static-build' };
  }

  try {
    const [user, repos, events] = await Promise.all([
      gh<RawUser>(`/users/${OWNER}`, opts),
      gh<RawRepo[]>(`/users/${OWNER}/repos?per_page=100&sort=pushed`, opts),
      gh<RawEvent[]>(`/users/${OWNER}/events/public?per_page=100`, opts).catch(() => []),
    ]);
    return {
      user: mapUser(user),
      repos: (repos ?? []).map(mapRepo),
      events: (events ?? []).map(mapEvent).filter((e): e is Ghevent => e !== null),
      live: Boolean(opts.live),
      rateLimited: false,
      updatedAt: new Date().toISOString(),
      source: opts.live ? 'github-api' : 'build-snapshot',
    };
  } catch (err) {
    const ghErr = err instanceof GithubError ? err : null;
    return {
      ...MOCK_SNAPSHOT,
      rateLimited: Boolean(ghErr?.rateLimited),
      live: false,
      updatedAt: MOCK_SNAPSHOT.updatedAt,
      source: ghErr?.rateLimited ? 'fallback-cache (rate-limited)' : 'fallback-cache',
    };
  }
}

/**
 * Nama-nama README umum yang dicoba berurutan.
 * Dipakai dari raw.githubusercontent.com (CDN, TANPA rate limit GitHub API)
 * — penting karena halaman detail 91 repo di-prerender saat build.
 */
const README_NAMES = ['README.md', 'readme.md', 'Readme.md', 'README.rst', 'README'];

async function fetchRawReadme(slug: string): Promise<string | null> {
  for (const name of README_NAMES) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      // Ref `HEAD` bekerja untuk branch default apa pun (main/master/…).
      const res = await fetch(`https://raw.githubusercontent.com/${OWNER}/${slug}/HEAD/${name}`, {
        signal: ctrl.signal,
        // Halaman statik murni: beku saat build (lihat getGithubSnapshot).
        cache: 'force-cache',
      });
      if (res.ok) {
        const text = await res.text();
        if (text.trim()) return text;
      }
    } catch {
      // coba nama berikutnya
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/** Detail satu repo + README (untuk halaman /repo/[slug]). */
export async function getRepoDetail(slug: string): Promise<{ repo: RepoLite | null; readme: string | null }> {
  if (isStaticExport) {
    const repo = MOCK_SNAPSHOT.repos.find((r) => r.name === slug) ?? null;
    return { repo, readme: null };
  }
  // Metadata repo via API (best-effort, ISR 300 dtk); README via raw CDN
  // (tanpa rate limit) agar 91 halaman detail tetap lengkap saat build.
  const [repo, readme] = await Promise.all([
    gh<RawRepo>(`/repos/${OWNER}/${slug}`).catch(() => null),
    fetchRawReadme(slug),
  ]);
  return { repo: repo ? mapRepo(repo) : null, readme };
}
