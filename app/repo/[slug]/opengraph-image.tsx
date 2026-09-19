import { ImageResponse } from 'next/og';
import { getGithubSnapshot } from '@/lib/github';
import { RepoOg } from '@/lib/og-html';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
// Nilai statis (persyaratan parser config Next); diabaikan pada static export.
// Statik murni tanpa ISR: regenerasi ISR di Vercel pernah mencampur generasi
// render (DOM segar vs payload flight RSC basi) sehingga hydration gagal
// (React #418) di semua halaman. Data diperbarui per deploy — cron mingguan
// refresh-data push data baru -> auto-redeploy. Lihat CHANGELOG [Stack 2026.1].

/** Diperlukan agar route ini ikut di-pre-render pada `output: 'export'`. */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const snap = await getGithubSnapshot();
  return snap.repos.map((r) => ({ slug: r.name }));
}

/**
 * Dynamic OG image untuk halaman detail repo (file convention).
 * - Static export: dirender per-slug saat build (generateStaticParams).
 * - Vercel/server: dirender on-demand & di-cache ISR 1 jam.
 */
export default async function RepoOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const snap = await getGithubSnapshot();
  const repo = snap.repos.find((r) => r.name === slug);

  return new ImageResponse(
    <RepoOg
      name={repo?.name ?? slug}
      description={repo?.description ?? null}
      language={repo?.language ?? null}
      stars={repo?.stars ?? 0}
      fork={repo?.fork ?? false}
    />,
    {
      ...size,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    },
  );
}
