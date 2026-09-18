import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * POST /api/pay/midtrans — buat transaksi Midtrans SNAP (server-side).
 *
 * Body:  { amount: number (IDR), name: string, freq?: 'once' | 'monthly' }
 * Balas: { token, redirect_url }  ->  klien memanggil snap.pay(token)
 *
 * Kunci MIDTRANS_SERVER_KEY tidak pernah terekspos ke klien. Transaksi dibuat
 * via Snap API v1 (https://app.midtrans.com/snap/v1/transactions).
 * NB: donasi "bulanan" di Midtrans memerlukan langganan SNAP Recurring;
 * untuk saat ini monthly diarahkan ke GitHub Sponsors (lihat PaymentModal).
 */
export async function POST(req: Request) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json(
      { error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi di server.' },
      { status: 503 },
    );
  }

  let body: { amount?: number; name?: string; freq?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  const amount = Math.round(Number(body.amount));
  const name = String(body.name ?? 'Donasi Open Source').slice(0, 80);

  if (!Number.isFinite(amount) || amount < 10_000 || amount > 10_000_000) {
    return NextResponse.json({ error: 'Nominal harus antara Rp 10.000 – Rp 10.000.000.' }, { status: 400 });
  }

  const orderId = `nium-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch('https://app.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // Snap API memakai Basic auth: base64(serverKey + ":")
        Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`,
      },
      body: JSON.stringify({
        transaction_details: { order_id: orderId, gross_amount: amount },
        item_details: [{ id: 'donasi', name, price: amount, quantity: 1, category: 'donasi' }],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[pay/midtrans] Snap API ${res.status}:`, text.slice(0, 300));
      return NextResponse.json(
        { error: 'Midtrans menolak permintaan. Cek kunci / nominal.' },
        { status: 502 },
      );
    }
    const data = (await res.json()) as { token: string; redirect_url: string };
    return NextResponse.json({ token: data.token, redirectUrl: data.redirect_url, orderId });
  } catch {
    return NextResponse.json({ error: 'Tidak dapat menghubungi Midtrans (timeout/jaringan).' }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
