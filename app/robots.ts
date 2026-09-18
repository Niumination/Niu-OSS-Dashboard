import type { MetadataRoute } from 'next';

// Diperlukan agar route ini tetap statis pada `output: 'export'` (GitHub Pages).
export const dynamic = 'force-static';

const base = process.env.SITE_URL ?? 'https://niumination.web.id';

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
