import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { generateUserSig, trtcConfig } from '@/lib/trtc/signature';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * POST /api/chat/owner-sig  (header: x-cs-token)
 *
 * Menerbitkan UserSig untuk akun PEMILIK (niu_owner) — dipakai halaman
 * /cs (inbox admin). Berbeda dengan /api/chat/usersig, route ini digerbang
 * token bersama (env CS_ADMIN_TOKEN) yang hanya diketahui pemilik.
 *
 *  - Perbandingan token memakai timingSafeEqual (anti timing attack).
 *  - Rate limit ketat: 10 percobaan / 10 menit per IP.
 */
function tokenMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const cfg = trtcConfig();
  const expected = process.env.CS_ADMIN_TOKEN ?? '';
  if (!cfg.ready || !expected) {
    return NextResponse.json({ error: 'belum dikonfigurasi' }, { status: 503 });
  }

  const rl = await rateLimit(`owner-sig:${clientIp(req)}`, 10, 600);
  if (!rl.ok) {
    return NextResponse.json({ error: 'terlalu banyak percobaan' }, { status: 429 });
  }

  const token = (req.headers.get('x-cs-token') ?? '').trim();
  if (!token || !tokenMatches(token, expected)) {
    return NextResponse.json({ error: 'token salah' }, { status: 401 });
  }

  const expire = 12 * 3600; // sesi kerja sehari cukup; minta ulang bila kedaluwarsa
  const userSig = generateUserSig({
    sdkAppId: cfg.sdkAppId,
    secretKey: cfg.secretKey,
    userId: cfg.ownerId,
    expireSeconds: expire,
  });

  return NextResponse.json(
    { sdkAppId: cfg.sdkAppId, userId: cfg.ownerId, userSig, expire },
    { headers: { 'cache-control': 'no-store' } },
  );
}
