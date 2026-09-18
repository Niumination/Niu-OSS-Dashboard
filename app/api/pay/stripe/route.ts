import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * POST /api/pay/stripe — buat Stripe Checkout Session (server-side).
 *
 * Body:  { amount: number (IDR), name: string }
 * Balas: { url }  ->  klien diarahkan ke halaman checkout Stripe
 *
 * Menggunakan Stripe REST API langsung (tanpa SDK) — form-encoded.
 * IDR adalah mata uang zero-decimal di Stripe: unit_amount = nominal penuh.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY belum dikonfigurasi.' }, { status: 503 });
  }

  let body: { amount?: number; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  const amount = Math.round(Number(body.amount));
  const name = String(body.name ?? 'Donasi Open Source').slice(0, 80);

  if (!Number.isFinite(amount) || amount < 10_000 || amount > 100_000_000) {
    return NextResponse.json({ error: 'Nominal harus antara Rp 10.000 – Rp 100.000.000.' }, { status: 400 });
  }

  const base = process.env.SITE_URL ?? new URL(req.url).origin;
  const params = new URLSearchParams({
    mode: 'payment',
    success_url: `${base}/services?bayar=sukses`,
    cancel_url: `${base}/?bayar=batal`,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'idr',
    'line_items[0][price_data][unit_amount]': String(amount),
    'line_items[0][price_data][product_data][name]': name,
    'line_items[0][price_data][product_data][description]': 'Niumination — open source & layanan teknis',
  });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[pay/stripe] Stripe API ${res.status}:`, text.slice(0, 300));
      return NextResponse.json({ error: 'Stripe menolak permintaan. Cek kunci / nominal.' }, { status: 502 });
    }
    const data = (await res.json()) as { url: string };
    return NextResponse.json({ url: data.url });
  } catch {
    return NextResponse.json({ error: 'Tidak dapat menghubungi Stripe (timeout/jaringan).' }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
