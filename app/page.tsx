import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Code2,
  Coffee,
  Heart,
  MessagesSquare,
  Rocket,
  Stethoscope,
  Wrench,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import Hero3D from '@/components/Hero3D';
import ErrorBoundary from '@/components/ErrorBoundary';
import RepoCard from '@/components/RepoCard';
import SectionHead from '@/components/SectionHead';
import { getGithubSnapshot } from '@/lib/github';
import { computeSummary } from '@/lib/summary';
import { SERVICE_PACKAGES, SITE } from '@/lib/site.config';
import type { RepoLite } from '@/lib/types';
import { formatIDR, timeAgo } from '@/lib/utils';

export const revalidate = 300;

const PKG_ICON = {
  consult: MessagesSquare,
  audit: Stethoscope,
  custom: Code2,
} as const;

export default async function Home() {
  const snap = await getGithubSnapshot();
  const s = computeSummary(snap);

  const byName = new Map(snap.repos.map((r) => [r.name, r]));
  const featured = (
    SITE.featuredRepos.map((n) => byName.get(n)).filter(Boolean) as RepoLite[]
  ).slice(0, 4);
  const showFeatured = featured.length
    ? featured
    : [...snap.repos]
        .filter((r) => !r.fork)
        .sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt))
        .slice(0, 4);

  const recent = snap.events.slice(0, 6);

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[1440px] px-4 pt-5 pb-16 md:px-6 md:pt-6 lg:px-8">
        <ErrorBoundary label="hero">
          <Hero3D
            stats={{
              repos: s.totalRepos,
              stars: s.totalStars,
              forks: s.totalForks,
              followers: s.followers,
            }}
          />
        </ErrorBoundary>

        {/* Featured work */}
        <section className="mt-14">
          <SectionHead
            icon={Rocket}
            micro="featured // pilihan editor"
            title="Karya Unggulan"
            sub="Empat proyek yang paling mewakili arah kerja saat ini — dari civic tech Aceh sampai AI terminal 7 MB."
            action={{ href: '/repositories', label: 'Semua repositori' }}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {showFeatured.map((r, i) => (
              <RepoCard key={r.name} repo={r} index={i} />
            ))}
          </div>
        </section>

        {/* Services teaser + support panel */}
        <section className="mt-14">
          <SectionHead
            icon={Wrench}
            micro="services // jasa & komisi"
            title="Bekerja Bareng"
            sub="Konsultasi, audit, atau aplikasi web custom — mulai dari brief di bawah ini."
            action={{ href: '/services', label: 'Lihat semua' }}
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-12">
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
              {SERVICE_PACKAGES.map((p) => {
                const Icon = PKG_ICON[p.icon];
                return (
                  <Link
                    key={p.id}
                    href="/services"
                    className="card-glow group flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-ember/35"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-ember/10 text-ember">
                      <Icon className="size-[18px]" />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold text-cream">{p.name}</h3>
                    <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-cream/55">
                      {p.blurb}
                    </p>
                    <div className="mt-3 flex-1 font-display text-[20px] tabular-nums text-cream">
                      {formatIDR(p.price)}
                      <span className="ml-1.5 font-mono text-[9.5px] tracking-wider text-cream/45">
                        {p.unit}
                      </span>
                    </div>
                    <span className="mt-4 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-cream/50 transition-colors group-hover:text-ember">
                      Mulai proses <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-ember/30 bg-gradient-to-br from-ember/[0.22] via-ink-2 to-ink-2 p-6 lg:col-span-5">
              <div className="dotgrid pointer-events-none absolute inset-0 text-cream opacity-[0.06]" />
              <div className="relative">
                <div className="micro flex items-center gap-2 text-cream/60">
                  <Heart className="size-3.5 text-ember" />
                  support // open source
                </div>
                <h3 className="mt-3 font-display text-[28px] leading-tight tracking-tight text-cream">
                  Dukung Open Source
                </h3>
                <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-cream/65">
                  Setiap repo di sini gratis dan terbuka. Donasi menjaga server, domain, dan waktu
                  membangunnya — sekali atau bulanan.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a
                    href={SITE.sponsors}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center gap-2 rounded-full bg-ember px-5 font-mono text-[10.5px] uppercase tracking-wider text-ink transition hover:bg-ember-soft hover:shadow-glow"
                  >
                    <Heart className="size-3.5" /> GitHub Sponsors
                  </a>
                  <a
                    href={SITE.buyMeACoffee}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 font-mono text-[10.5px] uppercase tracking-wider text-cream transition hover:bg-white/10"
                  >
                    <Coffee className="size-3.5" /> Buy Me a Coffee
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest activity */}
        <section className="mt-14">
          <SectionHead
            icon={Activity}
            micro="activity // feed github"
            title="Aktivitas Terbaru"
            sub="Push, release, dan event publik lain — langsung dari Events API."
            action={{ href: '/system', label: 'System & Metrics' }}
          />
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {recent.map((e) => {
              const slug = e.repo.split('/')[1] ?? e.repo;
              return (
                <Link
                  key={e.id}
                  href={`/repo/${slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-ember/30"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ember/10 text-ember">
                    <Activity className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] text-cream/85">{e.summary}</div>
                    <div className="truncate font-mono text-[10px] text-cream/40">{e.repo}</div>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-cream/35">
                    {timeAgo(e.createdAt)}
                  </span>
                </Link>
              );
            })}
            {recent.length === 0 && (
              <p className="font-mono text-[11px] text-cream/40">Belum ada event publik tercatat.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
