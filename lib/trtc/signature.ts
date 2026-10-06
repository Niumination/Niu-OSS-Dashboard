/**
 * Generator UserSig Tencent RTC Chat (algoritme TLSSigAPIv2) — murni Node.js
 * (crypto + zlib bawaan), tanpa dependensi eksternal.
 *
 * WAJIB hanya dipakai di sisi server (route handler runtime Node):
 * `_sign` memakai SDKSecretKey yang tidak boleh pernah sampai ke bundel klien.
 *
 * Urutan algoritme (dok TLSSigAPIv2):
 *   1) HMAC-SHA256 atas string `TLS.*:\n` berurutan
 *   2) JSON dok ver "2.0" -> deflate -> base64url (+ -> *, / -> -, strip = -> _)
 *
 * Diverifikasi round-trip (deflate/inflate) di tests/trtc-signature.test.ts.
 */
import crypto from 'node:crypto';
import zlib from 'node:zlib';

export interface UserSigOptions {
  sdkAppId: number;
  /** SDKSecretKey dari console.trtc.io — SERVER ONLY. */
  secretKey: string;
  userId: string;
  /** Umur tanda tangan; default 7 hari. */
  expireSeconds?: number;
}

export function generateUserSig(opts: UserSigOptions): string {
  const { sdkAppId, secretKey, userId } = opts;
  const expire = opts.expireSeconds ?? 7 * 24 * 3600;
  const currTime = Math.floor(Date.now() / 1000);

  const contentToSign =
    `TLS.identifier:${userId}\n` +
    `TLS.sdkappid:${sdkAppId}\n` +
    `TLS.time:${currTime}\n` +
    `TLS.expire:${expire}\n`;

  const sig = crypto
    .createHmac('sha256', secretKey)
    .update(contentToSign, 'utf8')
    .digest('base64');

  const doc = {
    'TLS.ver': '2.0',
    'TLS.identifier': String(userId),
    'TLS.sdkappid': Number(sdkAppId),
    'TLS.expire': Number(expire),
    'TLS.time': Number(currTime),
    'TLS.sig': sig,
  };

  return zlib
    .deflateSync(Buffer.from(JSON.stringify(doc), 'utf8'))
    .toString('base64')
    .replace(/\+/g, '*')
    .replace(/\//g, '-')
    .replace(/=+$/g, '_');
}

/** Konfigurasi TRTC dari env — satu sumber untuk ketiga route chat. */
export function trtcConfig() {
  const sdkAppId = Number(
    process.env.TRTC_SDK_APP_ID ?? process.env.NEXT_PUBLIC_TRTC_SDK_APP_ID ?? 0,
  );
  return {
    sdkAppId,
    secretKey: process.env.TRTC_SDK_SECRET_KEY ?? '',
    adminId: process.env.TRTC_ADMIN_ID ?? 'administrator',
    botId: process.env.TRTC_BOT_ID ?? 'niu_bot',
    ownerId: process.env.TRTC_OWNER_ID ?? 'niu_owner',
    get ready() {
      return this.sdkAppId > 0 && this.secretKey.length > 0;
    },
  };
}
