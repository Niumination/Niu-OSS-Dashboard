import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/*
 * GET /api/pay/config — metode pembayaran mana yang aktif pada deployment ini.
 * Kunci server TIDAK pernah bocor; hanya boolean yang dikirim.
 *
 *   { midtrans: boolean, stripe: boolean }
 *
 * Midtrans aktif jika MIDTRANS_SERVER_KEY (server) DAN
 * NEXT_PUBLIC_MIDTRANS_CLIENT_KEY (snap.js di klien) terisi.
 * Stripe aktif jika STRIPE_SECRET_KEY terisi.
 */
export async function GET() {
  return NextResponse.json({
    midtrans: Boolean(process.env.MIDTRANS_SERVER_KEY && process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}
