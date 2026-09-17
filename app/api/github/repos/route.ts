import { NextResponse } from 'next/server';
import { getGithubSnapshot } from '@/lib/github';
import { categorize } from '@/lib/categories';

export const revalidate = 300;

/** GET /api/github/repos — seluruh repositori publik + kategori otomatis. */
export async function GET() {
  const snap = await getGithubSnapshot();
  return NextResponse.json({
    total: snap.repos.length,
    repos: snap.repos.map((r) => ({ ...r, category: categorize(r) })),
    live: snap.live,
    updatedAt: snap.updatedAt,
    source: snap.source,
  });
}
