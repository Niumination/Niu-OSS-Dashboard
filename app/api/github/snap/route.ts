import { NextResponse } from 'next/server';
import { getGithubSnapshot } from '@/lib/github';

export async function GET() {
  try {
    const snap = await getGithubSnapshot({ live: true });
    return NextResponse.json({
      live: snap.live,
      source: snap.source,
      updatedAt: snap.updatedAt,
      totalRepos: snap.repos.length,
      owner: process.env.GITHUB_OWNER,
      hasToken: !!process.env.GITHUB_TOKEN,
      tokenPrefix: process.env.GITHUB_TOKEN
        ? `${process.env.GITHUB_TOKEN.slice(0, 8)}...${process.env.GITHUB_TOKEN.slice(-6)}`
        : 'none',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
