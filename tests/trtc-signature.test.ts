import { describe, expect, it } from 'vitest';
import zlib from 'node:zlib';
import { generateUserSig } from '@/lib/trtc/signature';

/*
 * UserSig (TLSSigAPIv2): base64url(deflate(JSON ver 2.0 + HMAC-SHA256)).
 * Uji round-trip penuh: kembalikan base64url -> inflate -> dokumen JSON
 * harus berisi seluruh medan TLS.* yang konsisten.
 */
const APP_ID = 20000000;
const SECRET = 'rahasia-uji';

function decode(sig: string): Record<string, unknown> {
  const b64 = sig.replace(/\*/g, '+').replace(/-/g, '/').replace(/_/g, '=');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return JSON.parse(zlib.inflateSync(Buffer.from(padded, 'base64')).toString('utf8'));
}

describe('trtc — generateUserSig', () => {
  it('menghasilkan base64url ala Tencent (tanpa +, /, =)', () => {
    const sig = generateUserSig({ sdkAppId: APP_ID, secretKey: SECRET, userId: 'guest_abc' });
    expect(sig).toMatch(/^[A-Za-z0-9*_-]+$/);
  });

  it('dokumen ver 2.0 membawa identitas, appid, dan HMAC', () => {
    const sig = generateUserSig({
      sdkAppId: APP_ID,
      secretKey: SECRET,
      userId: 'guest_xyz123',
      expireSeconds: 3600,
    });
    const doc = decode(sig);
    expect(doc['TLS.ver']).toBe('2.0');
    expect(doc['TLS.identifier']).toBe('guest_xyz123');
    expect(doc['TLS.sdkappid']).toBe(APP_ID);
    expect(doc['TLS.expire']).toBe(3600);
    expect(typeof doc['TLS.time']).toBe('number');
    expect(String(doc['TLS.sig'])).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });

  it('deterministik per detik & userId, berubah saat userId berubah', () => {
    const a = generateUserSig({ sdkAppId: APP_ID, secretKey: SECRET, userId: 'guest_sama' });
    const b = generateUserSig({ sdkAppId: APP_ID, secretKey: SECRET, userId: 'guest_sama' });
    const c = generateUserSig({ sdkAppId: APP_ID, secretKey: SECRET, userId: 'guest_beda' });
    expect(a).toBe(b); // waktu & input sama -> sig sama
    expect(a).not.toBe(c);
  });

  it('secret berbeda -> tanda tangan berbeda (anti salah-konfigurasi)', () => {
    const a = generateUserSig({ sdkAppId: APP_ID, secretKey: SECRET, userId: 'guest_k' });
    const b = generateUserSig({ sdkAppId: APP_ID, secretKey: 'secret-lain', userId: 'guest_k' });
    expect(a).not.toBe(b);
  });
});
