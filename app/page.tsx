import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Code2,
  Coffee,
  Heart,
  MessagesSquare,
  Rocket,
  Stethoscope,
  Tag,
  Wrench,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import Hero3D from '@/components/Hero3D';
import ErrorBoundary from '@/components/ErrorBoundary';
import RepoCard from '@/components/RepoCard';
import SectionHead from '@/components/SectionHead';
import { getGithubSnapshot, getRecentReleases } from '@/lib/github';
import { CASE_STUDIES } from '@/lib/case-studies';
import { StudiesTeaser } from '@/components/studies-ui';
import { computeSummary } from '@/lib/summary';
import { SERVICE_PACKAGES, SITE } from '@/lib/site.config';
import type { RepoLite } from '@/lib/types';
import { formatIDR, langColor, timeAgo } from '@/lib/utils';
import T from '@/components/T';

export const revalidate = 300;

const PKG_ICON = {
  consult: MessagesSquare,
  audit: Stethoscope,
  custom: Code2,
} as const;

export default async function Home() {
  const snap = await getGithubSnapshot();
  const s = computeSummary(snap);
  const releases = await getRecentReleases(snap);

  // Tech stack agregat untuk marquee: top bahasa + top topik.
  const langCount = new Map<string, number>();
  const topicCount = new Map<string, number>();
  for (const r of snap.repos) {
    if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
    for (const t of r.topics) topicCount.set(t, (topicCount.get(t) ?? 0) + 1);
  }
  const topLanguages = [...langCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topTopics = [...topicCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([t]) => t);

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

        {/* Marquee tech stack — agregat bahasa & topik dari seluruh repo */}
        <div
          className="mt-8 overflow-hidden border-y border-white/[0.06] py-3"
        >
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center gap-8" aria-hidden={dup === 1}>
                {topLanguages.map(([lang, n]) => (
                  <span
                    key={`l-${dup}-${lang}`}
                    className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-cream/55"
                  >
                    <span className="size-2 rounded-full" style={{ background: langColor(lang) }} />
                    {lang}
                    <span className="text-cream/25">×{n}</span>
                  </span>
                ))}
                {topTopics.map((t) => (
                  <span
                    key={`t-${dup}-${t}`}
                    className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-cream/35"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Featured work */}
        <section className="mt-14">
          <SectionHead
            icon={Rocket}
            micro={<T k="home.featured.micro" />}
            title={<T k="home.featured.title" />}
            sub={<T k="home.featured.sub" />}
            action={{ href: '/repositories', label: <T k="home.featured.cta" /> }}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {showFeatured.map((r, i) => (
              <RepoCard key={r.name} repo={r} index={i} />
            ))}
          </div>
        </section>

        {/* Studi kasus teaser */}
        <section className="mt-14">
          <SectionHead
            icon={BookOpen}
            micro={<T k="home.studies.micro" />}
            title={<T k="home.studies.title" />}
            sub={<T k="home.studies.sub" />}
            action={{ href: '/studies', label: <T k="home.studies.cta" /> }}
          />
          <StudiesTeaser studies={CASE_STUDIES} />
        </section>

        {/* Rilisan terbaru (GraphQL, aktif saat GITHUB_TOKEN dipasang) */}
        {releases.length > 0 && (
          <section className="mt-14">
            <SectionHead
              icon={Tag}
              micro={<T k="home.releases.micro" />}
              title={<T k="home.releases.title" />}
              sub={<T k="home.releases.sub" />}
              action={{ href: '/repositories', label: <T k="home.featured.cta" /> }}
            />
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {releases.map((rel) => (
                <a
                  key={rel.url}
                  href={rel.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-spotlight/30"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-spotlight/10 text-spotlight">
                    <Tag className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] text-cream/85">
                      <span className="font-mono text-cream/50">{rel.repo}</span>{' '}
                      <span className="text-ember-soft">{rel.tagName || 'release'}</span>
                    </div>
                    <div className="truncate font-mono text-[10px] text-cream/40">{rel.name}</div>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-cream/35">
                    {timeAgo(rel.createdAt)}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Services teaser + support panel */}
        <section className="mt-14">
          <SectionHead
            icon={Wrench}
            micro={<T k="home.services.micro" />}
            title={<T k="home.services.title" />}
            sub={<T k="home.services.sub" />}
            action={{ href: '/services', label: <T k="home.services.cta" /> }}
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
                    <h3 className="mt-4 text-[15px] font-semibold text-cream">
                      <T k={`pkg.${p.id}.name`} />
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-cream/55">
                      <T k={`pkg.${p.id}.blurb`} />
                    </p>
                    <div className="mt-3 flex-1 font-display text-[20px] tabular-nums text-cream">
                      {formatIDR(p.price)}
                      <span className="ml-1.5 font-mono text-[9.5px] tracking-wider text-cream/45">
                        <T k={`pkg.${p.id}.unit`} />
                      </span>
                    </div>
                    <span className="mt-4 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-cream/50 transition-colors group-hover:text-ember">
                      <T k="home.services.start" /> <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
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
                  <T k="home.support.micro" />
                </div>
                <h3 className="mt-3 font-display text-[28px] leading-tight tracking-tight text-cream">
                  <T k="home.support.title" />
                </h3>
                <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-cream/65">
                  <T k="home.support.desc" />
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
            micro={<T k="home.activity.micro" />}
            title={<T k="home.activity.title" />}
            sub={<T k="home.activity.sub" />}
            action={{ href: '/system', label: <T k="home.activity.cta" /> }}
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
              <p className="font-mono text-[11px] text-cream/40"><T k="home.activity.empty" /></p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
