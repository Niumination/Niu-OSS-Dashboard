import { getGithubSnapshot } from '@/lib/github';

/*
 * GET /feed.xml — RSS 2.0 aktivitas publik Niumination.
 * Dibangun dari snapshot (live atau cadangan) sehingga selalu tersedia.
 * Daftarkan di layout metadata (alternates.types) dan pengguna bisa
 * berlangganan dari reader apa pun.
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
  const base = process.env.SITE_URL ?? 'https://niumination.github.io';

  const items = snap.events
    .slice(0, 30)
    .map(
      (e) =>
        `    <item>
      <title>${esc(`${e.repo} — ${e.summary}`)}</title>
      <link>https://github.com/${esc(e.repo)}</link>
      <guid isPermaLink="false">${esc(e.id)}</guid>
      <pubDate>${new Date(e.createdAt).toUTCString()}</pubDate>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Aktivitas Niumination</title>
    <link>${base}</link>
    <description>Sistem terbuka, dibangun di depan umum — push, rilisan, dan aktivitas publik lain dari github.com/Niumination.</description>
    <language>id</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600',
    },
  });
}
