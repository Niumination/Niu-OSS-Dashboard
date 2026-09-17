import type { MetadataRoute } from 'next';
import { getGithubSnapshot } from '@/lib/github';

// Diperlukan agar route ini tetap statis pada `output: 'export'` (GitHub Pages).
export const dynamic = 'force-static';

const base = process.env.SITE_URL ?? 'https://niumination.github.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snap = await getGithubSnapshot();

  const core: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/repositories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/system`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ];

  const repos: MetadataRoute.Sitemap = snap.repos.map((r) => ({
    url: `${base}/repo/${r.name}`,
    lastModified: new Date(r.pushedAt),
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...core, ...repos];
}
