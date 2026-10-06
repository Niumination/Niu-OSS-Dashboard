import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { generateUserSig, trtcConfig } from '@/lib/trtc/signature';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * GET /api/chat/usersig?userId=guest_xxx
 *
 * Menerbitkan UserSig untuk pengunjung widget chat (akun tamu).
 * Klien mengirim userId yang sudah tersimpan (localStorage); bila kosong,
 * route membuatkan ID tamu baru.
 *
 * Keamanan:
 *  - HANYA menerbitkan sig untuk ID berpola `guest_*` — ID bot/owner/admin
 *    tak bisa diminta di sini, jadi tak ada jalur menyamar sebagai pemilik.
 *  - TRTC_SDK_SECRET_KEY server-only (tanpa NEXT_PUBLIC_ — pelajaran #418).
 *  - Rate limit per IP — menahan penyalahgunaan minting massal.
 */
const GUEST_RE = /^guest_[A-Za-z0-9_-]{4,56}$/;

export async function GET(req: NextRequest) {
  const cfg = trtcConfig();
  if (!cfg.ready) {
    return NextResponse.json(
      { error: 'fitur chat belum dikonfigurasi di server' },
      { status: 503 },
    );
  }

  const rl = await rateLimit(`usersig:${clientIp(req)}`, 30, 60);
  if (!rl.ok) {
    return NextResponse.json({ error: 'terlalu banyak permintaan' }, { status: 429 });
  }

  let userId = (req.nextUrl.searchParams.get('userId') ?? '').trim();
  if (!userId) userId = `guest_${crypto.randomBytes(9).toString('hex')}`;
  if (!GUEST_RE.test(userId)) {
    return NextResponse.json(
      { error: 'userId tidak valid (harus berpola guest_*)' },
      { status: 403 },
    );
  }

  const expire = 7 * 24 * 3600;
  const userSig = generateUserSig({
    sdkAppId: cfg.sdkAppId,
    secretKey: cfg.secretKey,
    userId,
    expireSeconds: expire,
  });

  return NextResponse.json(
    { sdkAppId: cfg.sdkAppId, userId, userSig, expire },
    { headers: { 'cache-control': 'no-store' } },
  );
}
