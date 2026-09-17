import { NextResponse } from 'next/server';
import { getGithubSnapshot } from '@/lib/github';
import { computeSummary } from '@/lib/summary';

export const revalidate = 300;

/** GET /api/github/summary — metrik agregat (stats, bahasa, kategori, deployments). */
export async function GET() {
  const snap = await getGithubSnapshot();
  return NextResponse.json({
    ...computeSummary(snap),
    live: snap.live,
    updatedAt: snap.updatedAt,
    source: snap.source,
  });
}
