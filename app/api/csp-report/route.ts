import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * POST /api/csp-report — titik kumpul laporan pelanggaran CSP selama fase
 * Content-Security-Policy-Report-Only (AUDIT-2026.5 §T2).
 *
 * Browser mengirim dokumen JSON `{ 'csp-report': { ... } }` (format lama)
 * atau Report-To (format baru, array `body`). Keduanya diterima; yang
 * dicatat: direktif yang dilanggar, URI dokumen, dan sumber yang diblokir
 * (dipotong agar log tidak banjir).
 *
 * Tanpa DB: laporan masuk log Functions (Vercel → Observability), sama
 * seperti /api/vitals. Setelah 2–4 minggu bersih, naikkan header
 * Report-Only → enforcement (lihat docs/PANDUAN-OPS.md §CSP).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as
      | { 'csp-report'?: Record<string, unknown> }
      | Array<{ body?: Record<string, unknown> }>
      | null;

    const r: Record<string, unknown> | undefined = Array.isArray(body)
      ? body[0]?.body
      : body?.['csp-report'];

    if (r) {
      const cut = (v: unknown) => (typeof v === 'string' ? v.slice(0, 160) : v);
      console.info(
        `[csp] ${cut(r['violated-directive'] ?? r.effectiveDirective ?? '?')}` +
          ` blocked=${cut(r['blocked-uri'] ?? r.blockedURL ?? '-')}` +
          ` doc=${cut(r['document-uri'] ?? '-')}`,
      );
    }
  } catch {
    // payload tidak valid — abaikan
  }
  return new NextResponse(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
