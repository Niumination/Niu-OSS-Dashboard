import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  FolderGit2,
  GitBranch,
  GitFork,
  HardDrive,
  Package,
  Play,
  Star,
  Users,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import CloneBox from '@/components/CloneBox';
import QrCard from '@/components/QrCard';
import Readme from '@/components/Readme';
import RepoCard from '@/components/RepoCard';
import { getGithubSnapshot, getRepoDetail } from '@/lib/github';
import { isStaticExport, siteUrl } from '@/lib/env';
import { SITE } from '@/lib/site.config';
import type { RepoLite } from '@/lib/types';
import { formatDate, formatNumber, langColor, timeAgo } from '@/lib/utils';
import T from '@/components/T';
import RepoDescription from '@/components/RepoDescription';

// Statik murni tanpa ISR: regenerasi ISR di Vercel pernah mencampur generasi
// render (DOM segar vs payload flight RSC basi) sehingga hydration gagal
// (React #418) di semua halaman. Data diperbarui per deploy — cron mingguan
// refresh-data push data baru -> auto-redeploy. Lihat CHANGELOG [Stack 2026.1].
export const dynamicParams = true;

/**
 * Pre-render semua halaman detail repo (91+ slug) dari snapshot —
 * membuat static export (GitHub Pages) dan ISR Vercel sama-sama cepat.
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const snap = await getGithubSnapshot();
  return snap.repos.map((r) => ({ slug: r.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const snap = await getGithubSnapshot();
  const repo = snap.repos.find((r) => r.name === slug);
  if (!repo) {
    return { title: 'Repositori tidak ditemukan' };
  }
  const base = siteUrl;
  return {
    title: repo.name,
    description: repo.description ?? `Repositori ${repo.fullName} oleh Niumination.`,
    alternates: { canonical: `/repo/${repo.name}` },
    openGraph: {
      title: `${repo.name} — Niumination`,
      description: repo.description ?? undefined,
      url: `${base}/repo/${repo.name}`,
      // OG image per repo — file convention `opengraph-image.tsx` (satori).
      // Dipakai baik pada Vercel (ISR 1 jam) maupun static export (baked).
      images: [
        {
          url: `${base}/repo/${repo.name}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${repo.name} — Niumination`,
        },
      ],
    },
  };
}

/** Format ukuran repo GitHub (unit: KB) jadi KB/MB yang manusiawi. */
function formatSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default async function RepoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snap = await getGithubSnapshot();
  const inSnap = snap.repos.find((r) => r.name === slug);
  const detail = isStaticExport ? null : await getRepoDetail(slug);
  const repo: RepoLite | null = detail?.repo ?? inSnap ?? null;
  const readme = detail?.readme ?? null;

  if (!repo) {
    return (
      <AppShell snapshot={snap}>
        <div className="mx-auto max-w-[1440px] px-4 py-24 text-center md:px-6 lg:px-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-ember">404</p>
          <h1 className="mt-3 font-display text-5xl"><T k="r404.title" /></h1>
          <p className="mt-3 text-sm text-cream/60">
            <T k="r404.desc" vars={{ slug }} />
          </p>
          <Link
            href="/repositories"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-ember px-6 font-mono text-[11px] uppercase tracking-wider text-ink"
          >
            <T k="rep.title" />
          </Link>
        </div>
      </AppShell>
    );
  }

  const related = snap.repos
    .filter((r) => r.name !== repo.name && r.language === repo.language && !r.fork)
    .slice(0, 3);

  const stats: Array<{ icon: React.ComponentType<{ className?: string }>; label: string; value: string }> = [
    { icon: Star, label: 'stars', value: formatNumber(repo.stars) },
    { icon: GitFork, label: 'forks', value: formatNumber(repo.forks) },
    { icon: Eye, label: 'rd.stat.watchers', value: formatNumber(repo.watchers) },
    { icon: GitBranch, label: 'rd.stat.issues', value: formatNumber(repo.openIssues) },
    { icon: HardDrive, label: 'rd.stat.size', value: formatSize(repo.size) },
    { icon: Package, label: 'rd.stat.license', value: repo.license ?? '—' },
  ];

  // BreadcrumbList: membantu mesin pencari memahami hierarki Home → Repositori → repo.
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Repositori', item: `${siteUrl}/repositories` },
      { '@type': 'ListItem', position: 3, name: repo.fullName, item: `${siteUrl}/repo/${repo.name}` },
    ],
  };

  // SoftwareSourceCode (AUDIT-2026.5 §T6): kaya hasil pencarian untuk repo
  // publik — nama, bahasa, lisensi, statistik, dan tautan sumber.
  const jsonLdSoftware = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: repo.name,
    url: `${siteUrl}/repo/${repo.name}`,
    codeRepository: repo.url,
    description: repo.description ?? undefined,
    programmingLanguage: repo.language ?? undefined,
    license: repo.license ? `https://spdx.org/licenses/${repo.license}.html` : undefined,
    dateModified: repo.pushedAt,
    author: { '@type': 'Person', name: 'Niumination', url: SITE.github },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/StarAction',
        userInteractionCount: repo.stars,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ForkAction',
        userInteractionCount: repo.forks,
      },
    ],
  };

  return (
    <AppShell snapshot={snap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <Link
          href="/repositories"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cream/50 transition-colors hover:text-ember"
        >
          <ArrowLeft className="size-3.5" /> <T k="rd.back" />
        </Link>

        <header className="mt-5 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <FolderGit2 className="size-5 shrink-0 text-ember" />
              <h1 className="break-all font-mono text-[24px] font-semibold tracking-tight text-cream md:text-[32px]">
                <span className="text-cream/40">{repo.fullName.split('/')[0]}/</span>
                {repo.name}
              </h1>
              {repo.fork && (
                <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-cream/45">
                  fork
                </span>
              )}
              {repo.archived && (
                <span className="rounded-full border border-danger/30 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-danger">
                  <T k="rc.archived" />
                </span>
              )}
              {repo.language && (
                <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] text-cream/70">
                  <span className="size-2.5 rounded-full" style={{ background: langColor(repo.language) }} />
                  {repo.language}
                </span>
              )}
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed text-cream/70">
              <RepoDescription repo={repo} />
            </p>
            {repo.topics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {repo.topics.map((t) => (
                  <Link
                    key={t}
                    href={`/repositories?q=${encodeURIComponent(t)}`}
                    title={`topic: ${t}`}
                    className="rounded-full bg-white/[0.05] px-3 py-1 font-mono text-[10px] text-cream/55 transition-colors hover:bg-ember/15 hover:text-cream"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-2.5">
            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center gap-2 rounded-full bg-ember px-6 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-ember-soft hover:shadow-glow"
              >
                <Play className="size-4" /> <T k="rd.demo" />
              </a>
            )}
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 font-mono text-[11px] uppercase tracking-wider text-cream/80 transition hover:border-spotlight/50 hover:text-spotlight"
            >
              <ExternalLink className="size-4" /> <T k="rd.source" />
            </a>
          </div>
        </header>

        <CloneBox fullName={repo.fullName} />

        {/* Stats strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((st) => (
            <div key={st.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
              <div className="flex items-center gap-2 text-cream/45">
                <st.icon className="size-3.5 text-ember" />
                <span className="micro text-[8.5px]">
                  {st.label.startsWith('rd.') ? <T k={st.label} /> : st.label}
                </span>
              </div>
              <div className="mt-2 truncate font-display text-[20px] tabular-nums text-cream">{st.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] text-cream/35">
          <span><T k="rd.created" vars={{ date: formatDate(repo.createdAt) }} /></span>
          <span><T k="rd.pushed" vars={{ ago: timeAgo(repo.pushedAt) }} /></span>
        </div>

        {/* README */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-3.5">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-danger/70" />
              <span className="size-2.5 rounded-full bg-warn/70" />
              <span className="size-2.5 rounded-full bg-success/70" />
            </span>
            <span className="ml-2 font-mono text-[10.5px] text-cream/50">README.md</span>
            <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wider text-cream/40">
              {readme ? <T k="rd.readme.chars" vars={{ n: readme.length.toLocaleString('id-ID') }} /> : <T k="rd.readme.none" />}
            </span>
          </div>
          {readme ? (
            <Readme source={readme} />
          ) : (
            <div className="grid place-items-center px-6 py-16 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/40">
                {isStaticExport ? <T k="rd.readme.static" /> : <T k="rd.readme.missing" />}
              </p>
            </div>
          )}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <div className="micro text-cream/45">
              <T
                k={repo.language ? 'rd.related' : 'rd.related.none'}
                vars={repo.language ? { lang: repo.language } : undefined}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((r, i) => (
                <RepoCard key={r.name} repo={r} index={i} />
              ))}
            </div>
          </section>
        )}
        {/* QR share */}
        <QrCard
          url={`${siteUrl}/repo/${repo.name}`}
          filename={`qr-repo-${repo.name}.svg`}
        />

      </div>
    </AppShell>
  );
}
