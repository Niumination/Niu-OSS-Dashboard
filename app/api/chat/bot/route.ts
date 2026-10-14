import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { generateUserSig, trtcConfig } from '@/lib/trtc/signature';
import { answerVisitor, detectLocale, rateNotice } from '@/lib/trtc/bot-brain';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * POST /api/chat/bot — webhook callback Tencent Chat.
 *
 * Setup: console.trtc.io -> Chat -> Callback Configuration ->
 * aktifkan "Callback after C2C message sent" ->
 * URL: https://niumination.web.id/api/chat/bot
 *
 * Alur: setiap pesan C2C terkirim, Tencent POST ke sini. Bila tujuannya
 * akun bot, kita jawab lewat Chat REST API (pesan dari akun bot).
 * Tencent menuntut ACK cepat -> jawaban dihitung di latar belakang
 * via after() (tetap dieksekusi Vercel setelah respons terkirim).
 *
 * Anti-boros: rate limit per tamu (12 msg/menit) sebelum memanggil LLM —
 * tamu yang melewati batas diberi tahu sekali per 5 menit.
 */
const OK = { ActionStatus: 'OK', ErrorInfo: '', ErrorCode: 0 };

interface CallbackBody {
  CallbackCommand?: string;
  From_Account?: string;
  To_Account?: string;
  MsgBody?: Array<{ MsgType: string; MsgContent?: { Text?: string } }>;
}

export async function POST(req: NextRequest) {
  const cfg = trtcConfig();

  // Verifikasi dasar: callback memang untuk aplikasi kita.
  const qAppId = Number(req.nextUrl.searchParams.get('SdkAppid') ?? 0);
  if (!cfg.ready || qAppId !== cfg.sdkAppId) {
    return NextResponse.json(OK);
  }

  let body: CallbackBody = {};
  try {
    body = (await req.json()) as CallbackBody;
  } catch {
    return NextResponse.json(OK);
  }

  const from = body.From_Account ?? '';
  const to = body.To_Account ?? '';
  const incomingToBot =
    body.CallbackCommand === 'C2C.CallbackAfterSendMsg' &&
    from.startsWith('guest_') &&
    to === cfg.botId;
  if (!incomingToBot) return NextResponse.json(OK);

  const text =
    body.MsgBody?.find((m) => m.MsgType === 'TIMTextElem')?.MsgContent?.Text?.trim() ?? '';
  if (!text) return NextResponse.json(OK);

  after(async () => {
    try {
      // Rate limit sebelum mikir/LLM: 12 pesan/menit per tamu.
      const rl = await rateLimit(`bot:${from}`, 12, 60);
      if (!rl.ok) {
        const noticeOnce = await rateLimit(`bot-notice:${from}`, 1, 300);
        if (noticeOnce.ok) await sendBotText(cfg, from, rateNotice(detectLocale(text)));
        return;
      }
      const reply = await answerVisitor(text);
      await sendBotText(cfg, from, reply.text);
    } catch (e) {
      console.error('[chat/bot] gagal menjawab:', e);
    }
  });

  return NextResponse.json(OK);
}

/** Kirim pesan teks dari akun bot via Chat REST API (endpoint resmi per-region).
 *  Catatan: domain `adminapi.trtc.io` tidak terdaftar di DNS publik. Endpoint
 *  resmi per dokumentasi Tencent: Singapore `adminapisgp.im.qcloud.com`
 *  (backup: `adminapisgp.my-imcloud.com`). Override via env `TRTC_REST_BASE`. */
const TRTC_FLAKY_RETRIES = 2;
const TRTC_RETRY_DELAY_MS = 1500;

async function sendBotText(
  cfg: ReturnType<typeof trtcConfig>,
  toAccount: string,
  text: string,
) {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= TRTC_FLAKY_RETRIES; attempt++) {
    const result = await sendBotTextOnce(cfg, toAccount, text);
    if (result.ok) return;
    lastError = result.error;
    // 70003 = UserSig ditolak padahal valid (flaky sisi Tencent). Retry.
    if (result.errorCode !== 70003 || attempt === TRTC_FLAKY_RETRIES) break;
    await new Promise((r) => setTimeout(r, TRTC_RETRY_DELAY_MS * (attempt + 1)));
  }
  throw lastError ?? new Error('sendmsg gagal: unknown error');
}

async function sendBotTextOnce(
  cfg: ReturnType<typeof trtcConfig>,
  toAccount: string,
  text: string,
): Promise<{ ok: true } | { ok: false; error: Error; errorCode?: number }> {
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
        To_Account: toAccount,
        MsgRandom: Math.floor(Math.random() * 2 ** 31),
        MsgTimeStamp: Math.floor(Date.now() / 1000),
        MsgBody: [{ MsgType: 'TIMTextElem', MsgContent: { Text: text.slice(0, 1500) } }],
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const json = (await res.json()) as { ActionStatus?: string; ErrorCode?: number };
    if (json.ActionStatus === 'OK' && json.ErrorCode === 0) return { ok: true };
    return {
      ok: false,
      error: new Error(`sendmsg gagal: ${JSON.stringify(json)}`),
      errorCode: json.ErrorCode,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
