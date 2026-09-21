import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const hasToken = !!token;
  const tokenLength = token?.length ?? 0;
  const tokenPrefix = token ? `${token.slice(0, 8)}...${token.slice(-6)}` : 'none';

  try {
    const res = await fetch('https://api.github.com/users/Niumination', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'niumination-dashboard',
      },
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();
    return NextResponse.json({
      hasToken, tokenLength, tokenPrefix,
      ok: res.ok,
      status: res.status,
      bodyPreview: text.slice(0, 150),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
