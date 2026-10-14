// Route DEBUG sementara — HAPUS setelah troubleshooting selesai.
// Tujuan: melihat error asli saat Vercel memanggil REST API Tencent
// (route /api/chat/bot menelan error di after()).
import { NextResponse } from 'next/server';
import { generateUserSig, trtcConfig } from '@/lib/trtc/signature';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cfg = trtcConfig();
  const usersig = generateUserSig({
    sdkAppId: cfg.sdkAppId,
    secretKey: cfg.secretKey,
    userId: cfg.adminId,
    expireSeconds: 3600,
  });

  const restBase =
    process.env.TRTC_REST_BASE?.replace(/\/+$/, '') ||
    'https://adminapisgp.im.qcloud.com';

  const url =
    `${restBase}/v4/openim/sendmsg` +
    `?sdkappid=${cfg.sdkAppId}` +
    `&identifier=${encodeURIComponent(cfg.adminId)}` +
    `&usersig=${encodeURIComponent(usersig)}` +
    `&random=${Math.floor(Math.random() * 2 ** 32)}` +
    `&contenttype=json`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        SyncOtherMachine: 1,
        From_Account: cfg.botId,
        To_Account: 'guest_e2etest01',
        MsgRandom: Math.floor(Math.random() * 2 ** 31),
        MsgTimeStamp: Math.floor(Date.now() / 1000),
        MsgBody: [{ MsgType: 'TIMTextElem', MsgContent: { Text: '[debug] halo dari vercel' } }],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const text = await res.text();
    return NextResponse.json({ ok: true, http: res.status, tencent: text.slice(0, 300) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e).slice(0, 300) });
  }
}
