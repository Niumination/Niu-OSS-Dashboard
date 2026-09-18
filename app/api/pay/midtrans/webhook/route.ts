import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * POST /api/pay/midtrans/webhook — notifikasi pembayaran dari Midtrans.
 *
 * Tanda tangan diverifikasi (SHA-512 dari order_id + status_code + gross_amount
 * + server key) sebelum diproses. Tanpa database, notifikasi dicatat di log
 * server — sambungkan Supabase/DB bila ingin persistensi pesanan.
 *
 * Daftarkan URL ini di Midtrans Dashboard → Settings → Configuration:
 *   https://<domain-anda>/api/pay/midtrans/webhook
 */
export async function POST(req: Request) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json({ ok: false, error: 'server key belum dikonfigurasi' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'body tidak valid' }, { status: 400 });
  }

  const orderId = String(body.order_id ?? '');
  const statusCode = String(body.status_code ?? '');
  const grossAmount = String(body.gross_amount ?? '');
  const signatureKey = String(body.signature_key ?? '');
  const transactionStatus = String(body.transaction_status ?? 'unknown');

  const expected = createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  if (!orderId || signatureKey !== expected) {
    console.warn('[pay/midtrans/webhook] tanda tangan TIDAK valid — ditolak', orderId);
    return NextResponse.json({ ok: false, error: 'signature tidak valid' }, { status: 401 });
  }

  // Tanpa DB: catat di log (Vercel: Functions Log / log drain).
  console.info(`[pay/midtrans/webhook] ${orderId} -> ${transactionStatus}`, {
    payment_type: body.payment_type,
    gross_amount: grossAmount,
    transaction_time: body.transaction_time,
  });

  return NextResponse.json({ ok: true, orderId, status: transactionStatus });
}
