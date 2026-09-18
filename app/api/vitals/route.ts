import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * POST /api/vitals — menerima laporan Core Web Vitals dari komponen
 * <WebVitals/> (LCP, INP, CLS, TTFB, FCP).
 *
 * Tanpa DB: metrik dicatat ke log Functions (Vercel → Observability / log
 * drain). Untuk penyimpanan penuh, sambungkan Supabase/ClickHouse/Tinybird
 * di sini — bentuk datanya sudah siap.
 */
export async function POST(req: Request) {
  try {
    const m = (await req.json()) as {
      name?: string;
      value?: number;
      rating?: string;
      id?: string;
      path?: string;
    };
    if (typeof m.name === 'string' && typeof m.value === 'number') {
      console.info(
        `[vitals] ${m.name}=${m.value} (${m.rating ?? '?'}) id=${m.id ?? '-'} path=${m.path ?? '/'}`,
      );
    }
  } catch {
    // payload tidak valid — abaikan
  }
  return new NextResponse(null, { status: 204 });
}
