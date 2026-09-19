'use client';

/*
 * Komponen UI studi kasus — sadar-locale (id/en) via LocaleProvider.
 * Dipakai di: beranda (teaser), /studies (grid), /studies/[slug] (detail).
 * Data murni (CaseStudy) diteruskan dari halaman server — tetap SSR-able.
 */

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Play,
  Target,
  Wrench,
} from 'lucide-react';
import { GithubMark } from './GithubMark';
import type { CaseStudy } from '@/lib/case-studies';
import { localizedStudy } from '@/lib/case-studies';
import { useLocale } from './LocaleProvider';

export interface StudyFacts {
  fullName: string;
  language: string | null;
  license: string | null;
  url: string;
}

/* ── Teaser beranda ─────────────────────────────────────────────── */
export function StudiesTeaser({ studies }: { studies: CaseStudy[] }) {
  const { locale } = useLocale();
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      {studies.map((base) => {
        const c = localizedStudy(base, locale);
        return (
          <Link
            key={c.slug}
            href={`/studies/${c.slug}`}
            className="card-glow group relative overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.025] p-5 transition-colors hover:border-ember/35"
          >
            <div
              className="pointer-events-none absolute -top-16 -right-12 size-40 rounded-full opacity-[0.12] blur-3xl"
              style={{ background: c.accent }}
            />
            <div className="relative micro" style={{ color: c.accent }}>
              {c.kind}
            </div>
            <h3 className="relative mt-3 font-display text-[24px] leading-tight tracking-tight text-cream">
              {c.title}
            </h3>
            <p className="relative mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-cream/55">
              {c.tagline}
            </p>
            <span className="relative mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-cream/45 transition-colors group-hover:text-ember">
              <T k="home.studies.read" />
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* ── Grid index /studies ────────────────────────────────────────── */
export function StudiesGrid({ studies }: { studies: CaseStudy[] }) {
  const { locale } = useLocale();
  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-3">
      {studies.map((base, i) => {
        const c = localizedStudy(base, locale);
        return (
          <Link
            key={c.slug}
            href={`/studies/${c.slug}`}
            className="card-glow group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.025] p-6 transition-colors hover:border-ember/35"
          >
            <div
              className="pointer-events-none absolute -top-20 -right-16 size-52 rounded-full opacity-[0.13] blur-3xl"
              style={{ background: c.accent }}
            />
            <div className="relative flex items-center justify-between">
              <span className="micro" style={{ color: c.accent }}>
                {String(i + 1).padStart(2, '0')} · {c.kind}
              </span>
              <BookOpen className="size-4 text-cream/30" />
            </div>
            <h2 className="relative mt-4 font-display text-[28px] leading-tight tracking-tight text-cream">
              {c.title}
            </h2>
            <p className="relative mt-2 flex-1 text-[13px] leading-relaxed text-cream/60">
              {c.tagline}
            </p>
            <div className="relative mt-5 grid grid-cols-3 gap-2">
              {c.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/[0.07] bg-ink/50 px-3 py-2.5"
                >
                  <div className="truncate font-display text-[15px] text-cream">{m.value}</div>
                  <div className="mt-0.5 truncate font-mono text-[8px] uppercase tracking-wider text-cream/35">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative mt-5 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {c.stack.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[9px] text-cream/45"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <ArrowRight className="size-4 shrink-0 text-cream/40 transition-all group-hover:translate-x-0.5 group-hover:text-ember" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ── Detail /studies/[slug] ─────────────────────────────────────── */
export function StudyView({
  study: base,
  prev,
  next,
  repo,
}: {
  study: CaseStudy;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  repo: StudyFacts | null;
}) {
  const { locale } = useLocale();
  const c = localizedStudy(base, locale);

  return (
    <>
      {/* Hero */}
      <header className="relative mt-6 overflow-hidden rounded-4xl border border-white/10 bg-ink-2 p-7 md:p-10">
        <div
          className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full opacity-[0.14] blur-3xl"
          style={{ background: c.accent }}
        />
        <div className="dotgrid pointer-events-none absolute inset-0 text-cream opacity-[0.05]" />
        <div className="relative">
          <div className="micro" style={{ color: c.accent }}>
            {c.kind} · {c.year}
          </div>
          <h1 className="mt-3 font-display text-[42px] leading-[1.0] tracking-tight text-cream md:text-[56px]">
            {c.title}
          </h1>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-cream/70">{c.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {c.stack.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] text-cream/65"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {c.demo && (
              <a
                href={c.demo}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center gap-2 rounded-full bg-ember px-6 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-ember-soft hover:shadow-glow"
              >
                <Play className="size-4" /> <T k="studies.demo" />
              </a>
            )}
            <Link
              href={`/repo/${c.repo}`}
              className="flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 font-mono text-[11px] uppercase tracking-wider text-cream/80 transition hover:border-spotlight/50 hover:text-spotlight"
            >
              <GithubMark className="size-4" /> <T k="studies.repoBtn" />
            </Link>
          </div>
        </div>
      </header>

      {/* Metrik */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {c.metrics.map((m) => (
          <div key={m.label} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="truncate font-display text-[22px] text-cream">{m.value}</div>
            <div className="mt-1 truncate font-mono text-[8.5px] uppercase tracking-wider text-cream/40">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Masalah */}
      <Section icon={Target} micro={<T k="studies.sec1.micro" />} title={<T k="studies.sec1.title" />}>
        <p className="text-[14.5px] leading-relaxed text-cream/70">{c.problem}</p>
      </Section>

      {/* Pendekatan */}
      <Section icon={Wrench} micro={<T k="studies.sec2.micro" />} title={<T k="studies.sec2.title" />}>
        <ol className="space-y-4">
          {c.approach.map((a, i) => (
            <li key={a.title} className="flex gap-4">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl font-mono text-[12px] font-bold"
                style={{ background: `${c.accent}22`, color: c.accent }}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-cream">{a.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-cream/65">{a.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Hasil */}
      <Section icon={CheckCircle2} micro={<T k="studies.sec3.micro" />} title={<T k="studies.sec3.title" />}>
        <p className="text-[14.5px] leading-relaxed text-cream/70">{c.outcome}</p>
        {repo && (
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 font-mono text-[10px] text-cream/40">
            <span>
              <T k="studies.fact.repo" />: <span className="text-cream/70">{repo.fullName}</span>
            </span>
            <span>
              <T k="studies.fact.lang" />:{' '}
              <span className="text-cream/70">{repo.language ?? '—'}</span>
            </span>
            <span>
              <T k="studies.fact.license" />:{' '}
              <span className="text-cream/70">{repo.license ?? '—'}</span>
            </span>
            <span className="flex items-center gap-1">
              <ExternalLink className="size-3" />
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="text-ember/80 hover:text-ember hover:underline"
              >
                github.com/{repo.fullName}
              </a>
            </span>
          </p>
        )}
      </Section>

      {/* Navigasi antar studi */}
      <nav className="mt-12 grid gap-3 border-t border-white/[0.07] pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/studies/${prev.slug}`}
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-ember/30"
          >
            <ArrowLeft className="size-4 shrink-0 text-cream/40 transition-transform group-hover:-translate-x-0.5" />
            <div className="min-w-0">
              <div className="micro text-[8px] text-cream/35">
                <T k="studies.prev" />
              </div>
              <div className="truncate text-[13.5px] text-cream/80">{prev.title}</div>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/studies/${next.slug}`}
            className="group flex items-center justify-end gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 text-right transition-colors hover:border-ember/30"
          >
            <div className="min-w-0">
              <div className="micro text-[8px] text-cream/35">
                <T k="studies.next" />
              </div>
              <div className="truncate text-[13.5px] text-cream/80">{next.title}</div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-cream/40 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </nav>
    </>
  );
}

function Section({
  icon: Icon,
  micro,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  micro: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="micro flex items-center gap-2 text-cream/45">
        <Icon className="size-3.5 text-ember" />
        {micro}
      </div>
      <h2 className="mt-2 font-display text-[30px] tracking-tight text-cream md:text-[36px]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* <T> lokal — tipis, agar file ini mandiri. */
import { translate } from '@/lib/i18n';
function T({ k, vars }: { k: string; vars?: Record<string, string | number> }) {
  const { locale } = useLocale();
  return <>{translate(locale, k, vars)}</>;
}
