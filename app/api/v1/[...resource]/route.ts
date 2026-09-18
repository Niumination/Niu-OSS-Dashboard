import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/*
 * GET /api/v1/[...resource] — mirror server-mode dari API publik v1.
 *
 * Menyajikan file JSON yang sama dengan hasil `node scripts/gen-api.mjs`
 * (public/api/v1/**), sehingga kontrak API identik antara mode server
 * (npm start / Docker) dan mode statis (GitHub Pages: file dilayani
 * langsung, GitHub Pages menyetel Access-Control-Allow-Origin: *).
 *
 * + CORS terbuka (API publik read-only) + cache 60 detik.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=60, s-maxage=300',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
};

/** Endpoint tunggal yang diizinkan. */
const SINGLE = new Set(['index', 'user', 'repos', 'events', 'summary', 'uptime', 'studies']);
/** Endpoint dua segmen: {repos|studies}/<slug>. */
const COLLECTIONS = new Set(['repos', 'studies']);

function resolveResource(segments: string[]): string | null {
  if (segments.length === 1 && SINGLE.has(segments[0])) return segments[0];
  if (
    segments.length === 2 &&
    COLLECTIONS.has(segments[0]) &&
    /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segments[1])
  ) {
    return segments.join('/');
  }
  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ resource: string[] }> },
) {
  const { resource } = await params;
  const rel = resolveResource(resource ?? []);
  if (!rel) {
    return new Response(
      JSON.stringify({
        error: 'not_found',
        hint: 'Lihat /api/v1/index.json untuk daftar endpoint yang tersedia.',
      }),
      { status: 404, headers: JSON_HEADERS },
    );
  }

  try {
    const file = await readFile(join(process.cwd(), 'public', 'api', 'v1', `${rel}.json`), 'utf8');
    return new Response(file, { headers: JSON_HEADERS });
  } catch {
    return new Response(
      JSON.stringify({
        error: 'not_available',
        hint: 'Jalankan `node scripts/gen-api.mjs` untuk (re)generate file API, atau gunakan build statis.',
      }),
      { status: 503, headers: JSON_HEADERS },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      ...JSON_HEADERS,
      'access-control-allow-headers': 'content-type',
    },
  });
}
