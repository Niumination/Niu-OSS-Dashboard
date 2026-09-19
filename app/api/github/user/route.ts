import { NextResponse } from 'next/server';
import { getGithubSnapshot } from '@/lib/github';

export const revalidate = 300;

/** GET /api/github/user — profil singkat + status data (live/fallback). */
export async function GET() {
  const snap = await getGithubSnapshot({ live: true });
  return NextResponse.json({
    user: snap.user,
    live: snap.live,
    updatedAt: snap.updatedAt,
    source: snap.source,
  });
}
