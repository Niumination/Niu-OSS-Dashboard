import { ImageResponse } from 'next/og';
import { getGithubSnapshot } from '@/lib/github';
import { HomeOg, RepoOg } from '@/lib/og-html';
import { MOCK_SNAPSHOT } from '@/lib/mock-data';

/*
 * Dynamic OG Image (per halaman / detail repo) — next/og (satori).
 *
 *   GET /api/og/home               -> OG halaman utama
 *   GET /api/og/repo/<repo-name>   -> OG detail repositori
 *
 * Node runtime (Vercel maupun self-host Node 20.9+): `ImageResponse` tersedia
 * karena global Response/ReadableStream ada. Gambar di-cache 1 jam.
 */

export const runtime = 'nodejs';

const HEADERS = {
  'Content-Type': 'image/png',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
};

const opts = { width: 1200, height: 630, headers: HEADERS } as const;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await ctx.params;
  const [kind, name] = slug;

  if (kind === 'repo' && name) {
    const snap = await getGithubSnapshot();
    const repo = snap.repos.find((r) => r.name === name);
    return new ImageResponse(
      <RepoOg
        name={repo?.name ?? name}
        description={repo?.description ?? null}
        language={repo?.language ?? null}
        stars={repo?.stars ?? 0}
        fork={repo?.fork ?? false}
      />,
      opts,
    );
  }

  // default: home
  return new ImageResponse(
    <HomeOg
      repos={MOCK_SNAPSHOT.user.publicRepos}
      stars={MOCK_SNAPSHOT.repos.reduce((a, r) => a + r.stars, 0)}
      followers={MOCK_SNAPSHOT.user.followers}
    />,
    opts,
  );
}
