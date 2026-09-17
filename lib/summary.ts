import { categorize } from './categories';
import type { Deployment, Snapshot } from './types';

export interface Summary {
  totalRepos: number;
  originalRepos: number;
  totalStars: number;
  totalForks: number;
  followers: number;
  activeLast90d: number;
  withLiveDemo: number;
  languageCounts: { lang: string; count: number }[];
  categoryCounts: Record<string, number>;
  deployments: Deployment[];
  commitsLast4Weeks: number;
  eventsLast30d: number;
  mostUsedLanguage: string | null;
}

/** Hitung metrik agregat dari snapshot — dipakai Overview & System & Metrics. */
export function computeSummary(snap: Snapshot): Summary {
  const repos = snap.repos;
  const now = Date.now();
  const DAY = 86_400_000;

  const langMap = new Map<string, number>();
  const catCounts: Record<string, number> = {};
  let stars = 0;
  let forks = 0;
  let originals = 0;
  let live = 0;
  let active90 = 0;

  for (const r of repos) {
    stars += r.stars;
    forks += r.forks;
    if (!r.fork) originals += 1;
    if (r.homepage) live += 1;
    const age = (now - new Date(r.pushedAt).getTime()) / DAY;
    if (age <= 90) active90 += 1;
    if (r.language) langMap.set(r.language, (langMap.get(r.language) ?? 0) + 1);
    const cat = categorize(r);
    catCounts[cat] = (catCounts[cat] ?? 0) + 1;
  }

  const languageCounts = [...langMap.entries()]
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count);

  // Deployment: repo original dengan homepage, terbaru dulu.
  const deployments: Deployment[] = repos
    .filter((r) => r.homepage && !r.fork)
    .sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt))
    .slice(0, 10)
    .map((r) => ({ repo: r.name, url: r.homepage as string, pushedAt: r.pushedAt }));

  const pushEvents = snap.events.filter((e) => e.type === 'PushEvent');
  const commitsLast4Weeks = pushEvents
    .filter((e) => now - +new Date(e.createdAt) <= 28 * DAY)
    .reduce((acc, e) => acc + 1, 0);

  return {
    totalRepos: repos.length,
    originalRepos: originals,
    totalStars: stars,
    totalForks: forks,
    followers: snap.user.followers,
    activeLast90d: active90,
    withLiveDemo: live,
    languageCounts,
    categoryCounts: catCounts,
    deployments,
    commitsLast4Weeks,
    eventsLast30d: snap.events.filter((e) => now - +new Date(e.createdAt) <= 30 * DAY).length,
    mostUsedLanguage: languageCounts[0]?.lang ?? null,
  };
}
