import { getGithubSnapshot } from '@/lib/github';
import { CASE_STUDIES } from '@/lib/case-studies';
import { siteUrl } from '@/lib/env';

/*
 * GET /feed-studies.xml — RSS 2.0 katalog studi kasus (ROADMAP Fase 1:
 * "feed.xml kategori studi"). Item = studi, pubDate = tanggal repo sumber
 * dibuat (faktual dari snapshot), bukan tanggal sintetis.
 */

export const dynamic = 'force-static';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const snap = await getGithubSnapshot();
  const base = siteUrl;

  const items = CASE_STUDIES.map((c) => {
    const repo = snap.repos.find((r) => r.name === c.repo);
    const pubDate = repo ? new Date(repo.createdAt).toUTCString() : new Date().toUTCString();
    return `    <item>
      <title>${esc(`${c.title} — ${c.kind}`)}</title>
      <link>${base}/studies/${esc(c.slug)}</link>
      <guid>${base}/studies/${esc(c.slug)}</guid>
      <description>${esc(c.tagline)}</description>
      <category>${esc(c.kind)}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Studi Kasus Niumination</title>
    <link>${base}/studies</link>
    <description>Masalah, keputusan, hasil — karya Niumination dibedah apa adanya, semua klaim bisa diaudit dari kodenya.</description>
    <language>id</language>
    <atom:link href="${base}/feed-studies.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
