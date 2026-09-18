/*
 * GET /api/v1/[...resource] — mirror server-mode dari API publik v1.
 *
 * Menyajikan data yang sama dengan file statis hasil `node scripts/gen-api.mjs`
 * (public/api/v1/**) — kontrak identik antara mode server (Vercel / npm start /
 * Docker) dan mode statis (GitHub Pages: file dilayani langsung + ACAO:*).
 *
 * Implementasi: file JSON di-import saat BUILD (bukan dibaca via fs saat
 * runtime) — filesystem lambda Vercel tidak memuat public/, jadi pola fs
 * tidak portabel. Import statis ikut ter-bundle & ter-trace otomatis.
 */

import index from '@/public/api/v1/index.json';
import user from '@/public/api/v1/user.json';
import events from '@/public/api/v1/events.json';
import summary from '@/public/api/v1/summary.json';
import uptime from '@/public/api/v1/uptime.json';
import reposDoc from '@/public/api/v1/repos.json';
import studiesDoc from '@/public/api/v1/studies.json';
import studiesFull from '@/data/studies.json';

export const dynamic = 'force-dynamic';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=60, s-maxage=300',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
};

interface RepoEntry {
  name: string;
  [k: string]: unknown;
}
interface StudyEntry {
  slug: string;
  [k: string]: unknown;
}

const repos = (reposDoc as { repos: RepoEntry[] }).repos ?? [];
const repoGeneratedAt = (reposDoc as { generatedAt?: string }).generatedAt;
const studyGeneratedAt = (studiesDoc as { generatedAt?: string }).generatedAt;
const studies = (studiesFull as StudyEntry[]) ?? [];

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 1) + '\n', { status, headers: JSON_HEADERS });

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ resource: string[] }> },
) {
  const { resource } = await params;
  const seg = resource ?? [];

  // Endpoint tunggal.
  if (seg.length === 1) {
    switch (seg[0]) {
      case 'index':
        return json(index);
      case 'user':
        return json(user);
      case 'repos':
        return json(reposDoc);
      case 'events':
        return json(events);
      case 'summary':
        return json(summary);
      case 'uptime':
        return json(uptime);
      case 'studies':
        return json(studiesDoc);
    }
  }

  // Endpoint koleksi: repos/{name} · studies/{slug}.
  if (seg.length === 2 && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(seg[1])) {
    if (seg[0] === 'repos') {
      const repo = repos.find((r) => r.name === seg[1]);
      if (repo) return json({ generatedAt: repoGeneratedAt, repo });
      return json(
        { error: 'repo_not_found', hint: 'Lihat /api/v1/repos.json untuk daftar nama repo.' },
        404,
      );
    }
    if (seg[0] === 'studies') {
      const study = studies.find((s) => s.slug === seg[1]);
      if (study) return json({ generatedAt: studyGeneratedAt, study });
      return json(
        { error: 'study_not_found', hint: 'Lihat /api/v1/studies.json untuk daftar slug.' },
        404,
      );
    }
  }

  return json(
    {
      error: 'not_found',
      hint: 'Lihat /api/v1/index.json untuk daftar endpoint yang tersedia.',
    },
    404,
  );
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
