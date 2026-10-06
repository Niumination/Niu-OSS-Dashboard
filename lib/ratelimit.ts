/**
 * Rate limiter ringan untuk route publik (/api/chat/*).
 *
 * Dua lapisan:
 *  1) In-memory fixed-window per instance (selalu aktif, nol dependensi) —
 *     cukup untuk menahan spam kasar; di serverless tiap instance punya
 *     penghitung sendiri sehingga ini bukan garansi global.
 *  2) Upstash Redis REST (aktif otomatis bila UPSTASH_REDIS_REST_URL &
 *     UPSTASH_REDIS_REST_TOKEN terisi) — penghitung global lintas instance,
 *     tetap tanpa SDK (REST murni).
 *
 * Pakai: const rl = await rateLimit(`usersig:${ip}`, 30, 60); if (!rl.ok) ...
 */
import crypto from 'node:crypto';

export interface RateResult {
  ok: boolean;
  remaining: number;
  /** epoch detik kapan jendela berakhir. */
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function localHit(key: string, limit: number, windowSec: number): RateResult {
  const now = Math.floor(Date.now() / 1000);
  // Sapu berkala agar Map tidak tumbuh tak terbatas di instance berumur panjang.
  if (now - lastSweep > 300) {
    lastSweep = now;
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowSec };
    buckets.set(key, fresh);
    return { ok: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }
  b.count += 1;
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count), resetAt: b.resetAt };
}

async function upstashHit(key: string, limit: number, windowSec: number): Promise<RateResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return localHit(key, limit, windowSec); // fallthrough lokal

  const now = Math.floor(Date.now() / 1000);
  const rkey = `rl:${crypto.createHash('sha1').update(key).digest('hex').slice(0, 20)}`;
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify([
        ['INCR', rkey],
        ['EXPIRE', rkey, String(windowSec), 'NX'],
        ['TTL', rkey],
      ]),
      signal: AbortSignal.timeout(2500),
    });
    const rows = (await res.json()) as Array<{ result: number }>;
    const count = Number(rows?.[0]?.result ?? 1);
    const ttl = Number(rows?.[2]?.result ?? windowSec);
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: now + (ttl > 0 ? ttl : windowSec),
    };
  } catch {
    // Redis down tidak boleh mematikan fitur -> degradasi ke lokal.
    return localHit(key, limit, windowSec);
  }
}

export function rateLimit(key: string, limit: number, windowSec: number): Promise<RateResult> {
  return upstashHit(key, limit, windowSec);
}

/** IP klien sebaik mungkin di Vercel (forwarded header pertama). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim().slice(0, 64);
  return req.headers.get('x-real-ip')?.slice(0, 64) ?? 'unknown';
}
