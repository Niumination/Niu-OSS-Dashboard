import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AppShell from '@/components/AppShell';
import QrCard from '@/components/QrCard';
import T from '@/components/T';
import { StudyView, type StudyFacts } from '@/components/studies-ui';
import { getGithubSnapshot } from '@/lib/github';
import { CASE_STUDIES, getAdjacent, getStudy } from '@/lib/case-studies';
import { siteUrl } from '@/lib/env';

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getStudy(slug);
  if (!c) return { title: 'Studi kasus tidak ditemukan' };
  return {
    title: `Studi Kasus — ${c.title}`,
    description: c.tagline,
    alternates: { canonical: `/studies/${c.slug}` },
  };
}

/**
 * Halaman detail studi kasus — server shell (metadata, data, AppShell),
 * isi dirender <StudyView/> (client) agar ikut berganti bahasa (id/en).
 */
export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getStudy(slug);
  if (!c) notFound();

  const snap = await getGithubSnapshot();
  const repoRecord = snap.repos.find((r) => r.name === c.repo);
  const { prev, next } = getAdjacent(c.slug);

  const repo: StudyFacts | null = repoRecord
    ? {
        fullName: repoRecord.fullName,
        language: repoRecord.language,
        license: repoRecord.license,
        url: repoRecord.url,
      }
    : null;

  const base = siteUrl;

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[900px] px-4 pb-20 pt-8 md:px-6">
        <Link
          href="/studies"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cream/50 transition-colors hover:text-ember"
        >
          <ArrowLeft className="size-3.5" /> <T k="studies.back" />
        </Link>

        <StudyView
          study={c}
          prev={prev ? { slug: prev.slug, title: prev.title } : null}
          next={next ? { slug: next.slug, title: next.title } : null}
          repo={repo}
        />

        <QrCard url={`${base}/studies/${c.slug}`} filename={`qr-studi-${c.slug}.svg`} />
      </div>
    </AppShell>
  );
}
