/**
 * Tipe data bersama untuk seluruh dashboard.
 */

export interface RepoLite {
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  topics: string[];
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  license: string | null;
  size: number;
  createdAt: string;
  pushedAt: string;
}

export interface UserLite {
  login: string;
  name: string | null;
  avatar: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  joinedAt: string;
}

export interface Ghevent {
  id: string;
  type: string;
  repo: string;
  repoUrl: string;
  createdAt: string;
  /** Ringkasan aksi manusia, mis. "3 commits", "released v1.0.0". */
  summary: string;
}

export interface Snapshot {
  user: UserLite;
  repos: RepoLite[];
  events: Ghevent[];
  /** true = data segar dari GitHub API; false = snapshot fallback. */
  live: boolean;
  /** true = fallback dipicu oleh rate limit (bukan network error). */
  rateLimited: boolean;
  /** ISO timestamp snapshot dibuat. */
  updatedAt: string;
  /** 'github-api' | 'fallback-cache' | 'static-build'. */
  source: string;
}

export interface Deployment {
  repo: string;
  url: string;
  pushedAt: string;
}

/* ------------------------------ uptime ----------------------------------- */

/** Satu pemeriksaan mentah (24 jam terakhir). */
export interface UptimeCheck {
  t: string;
  ms: number | null;
  ok: boolean;
}

/** Agregat harian (30 hari terakhir). */
export interface UptimeDay {
  d: string;
  n: number;
  ok: number;
  ms: number;
}

export interface UptimeSite {
  repo: string;
  url: string;
  days: UptimeDay[];
  recent: UptimeCheck[];
}

export interface UptimeData {
  updatedAt: string;
  intervalMinutes: number;
  sites: UptimeSite[];
}
