import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  FolderGit2,
  GitBranch,
  GitFork,
  Lock,
  Package,
  Play,
  Star,
  Users,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import RepoCard from '@/components/RepoCard';
import { getGithubSnapshot, getRepoDetail } from '@/lib/github';
import { isStaticExport } from '@/lib/env';
import { SITE } from '@/lib/site.config';
import type { RepoLite } from '@/lib/types';
import { formatDate, formatNumber, langColor, timeAgo } from '@/lib/utils';

// Nilai statis (persyaratan parser config Next). Pada static export semua
// halaman memang dirender statis; dynamicParams diabaikan saat output: 'export'.
export const revalidate = 300;
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
    return { title: 'Repo tidak ditemukan' };
  }
  const base = process.env.SITE_URL ?? 'https://niumination.github.io';
  return {
    title: repo.name,
    description: repo.description ?? `Repositori ${repo.fullName} oleh Niumination.`,
    openGraph: {
      title: `${repo.name} — Niumination`,
      description: repo.description ?? undefined,
      url: `${base}/repo/${repo.name}`,
      // OG image per repo — file convention `opengraph-image.tsx` (satori).
      // Dipakai baik pada Vercel (ISR 1 jam) maupun static export (baked).
      // Varian dinamis juga tersedia di /api/og/repo/<nama> bila dibutuhkan.
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
          <h1 className="mt-3 font-display text-5xl">Repositori tidak ditemukan</h1>
          <p className="mt-3 text-sm text-cream/60">
            “{slug}” tidak ada di snapshot saat ini (mungkin di-rename atau dihapus).
          </p>
          <Link
            href="/repositories"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-ember px-6 font-mono text-[11px] uppercase tracking-wider text-ink"
          >
            All Repositories
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
    { icon: Users, label: 'watchers', value: formatNumber(repo.watchers) },
    { icon: GitBranch, label: 'open issues', value: formatNumber(repo.openIssues) },
    { icon: Package, label: 'size', value: `${Math.max(1, Math.round(repo.size / 102.4))} MB` },
    { icon: Lock, label: 'license', value: repo.license ?? '—' },
  ];

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <Link
          href="/repositories"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cream/50 transition-colors hover:text-ember"
        >
          <ArrowLeft className="size-3.5" /> all repositories
        </Link>

        <header className="mt-5 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <FolderGit2 className="size-5 text-ember" />
              <h1 className="break-all font-mono text-[24px] font-semibold tracking-tight text-cream md:text-[32px]">
                {repo.name}
              </h1>
              {repo.fork && (
                <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-cream/45">
                  fork
                </span>
              )}
              {repo.archived && (
                <span className="rounded-full border border-danger/30 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-danger">
                  archived
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
              {repo.description ?? '— repositori ini belum punya deskripsi.'}
            </p>
            {repo.topics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {repo.topics.map((t) => (
                  <span key={t} className="rounded-full bg-white/[0.05] px-3 py-1 font-mono text-[10px] text-cream/55">
                    #{t}
                  </span>
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
                <Play className="size-4" /> Live Demo
              </a>
            )}
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 font-mono text-[11px] uppercase tracking-wider text-cream/80 transition hover:border-spotlight/50 hover:text-spotlight"
            >
              <ExternalLink className="size-4" /> GitHub Source
            </a>
          </div>
        </header>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((st) => (
            <div key={st.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
              <div className="flex items-center gap-2 text-cream/45">
                <st.icon className="size-3.5 text-ember" />
                <span className="micro text-[8.5px]">{st.label}</span>
              </div>
              <div className="mt-2 truncate font-display text-[20px] tabular-nums text-cream">{st.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] text-cream/35">
          <span>dibuat {formatDate(repo.createdAt)}</span>
          <span>push terakhir {timeAgo(repo.pushedAt)}</span>
          <span>
            clone:{' '}
            <code className="text-cream/55">
              git clone https://github.com/{repo.fullName}.git
            </code>
          </span>
        </div>

        {/* README */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-3.5">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-danger/70" />
              <span className="size-2.5 rounded-full bg-warn/70" />
              <span className="size-2.5 rounded-full bg-success/70" />
            </span>
            <span className="ml-2 font-mono text-[10.5px] text-cream/50">README.md</span>
            <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wider text-cream/30">
              {readme ? `${readme.length.toLocaleString('id-ID')} chars` : 'tidak tersedia'}
            </span>
          </div>
          {readme ? (
            <pre className="max-h-[560px] overflow-auto codex-scroll whitespace-pre-wrap break-words p-6 font-mono text-[12px] leading-relaxed text-cream/70">
              {readme.slice(0, 20_000)}
              {readme.length > 20_000 && (
                <span className="text-cream/35">
                  {'\n\n… (dipotong — buka sumber untuk versi penuh)'}
                </span>
              )}
            </pre>
          ) : (
            <div className="grid place-items-center px-6 py-16 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/40">
                {isStaticExport
                  ? 'README tidak ikut pada static export — buka GitHub source.'
                  : 'README tidak ditemukan di repositori ini.'}
              </p>
            </div>
          )}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <div className="micro text-cream/45">
              related // juga dibuat dalam {repo.language ?? 'stack serupa'}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((r, i) => (
                <RepoCard key={r.name} repo={r} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
