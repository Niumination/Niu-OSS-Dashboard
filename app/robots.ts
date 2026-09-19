import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';

// Diperlukan agar route ini tetap statis pada `output: 'export'` (GitHub Pages).
export const dynamic = 'force-static';

const base = siteUrl;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
