import { NextResponse } from 'next/server';
export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const hasToken = !!token;
  const tokenLength = token?.length ?? 0;
  const tokenPrefix = token ? `${token.slice(0, 8)}...${token.slice(-6)}` : 'none';
  return NextResponse.json({ hasToken, tokenLength, tokenPrefix });
}
