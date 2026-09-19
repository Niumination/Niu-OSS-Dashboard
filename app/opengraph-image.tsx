import { ImageResponse } from 'next/og';
import { MOCK_SNAPSHOT } from '@/lib/mock-data';
import { HomeOg } from '@/lib/og-html';

export const alt = 'Niumination — Dasbor OSS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

/**
 * OG image statis untuk halaman utama (file convention Next.js) —
 * dirender dengan satori (next/og) pada build time.
 */
export default function OpengraphImage() {
  const element = (
    <HomeOg
      repos={MOCK_SNAPSHOT.user.publicRepos}
      stars={MOCK_SNAPSHOT.repos.reduce((a, r) => a + r.stars, 0)}
      followers={MOCK_SNAPSHOT.user.followers}
    />
  );
  return new ImageResponse(element, {
    ...size,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
