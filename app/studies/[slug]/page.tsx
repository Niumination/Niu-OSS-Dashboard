import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Github, Play, Target, Wrench } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { getGithubSnapshot } from '@/lib/github';
import { CASE_STUDIES, getStudy } from '@/lib/case-studies';

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

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getStudy(slug);
  if (!c) notFound();

  const snap = await getGithubSnapshot();
  const repo = snap.repos.find((r) => r.name === c.repo);
  const idx = CASE_STUDIES.findIndex((x) => x.slug === c.slug);
  const prev = CASE_STUDIES[idx - 1];
  const next = CASE_STUDIES[idx + 1];

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[900px] px-4 pb-20 pt-8 md:px-6">
        <Link
          href="/studies"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cream/50 transition-colors hover:text-ember"
        >
          <ArrowLeft className="size-3.5" /> semua studi kasus
        </Link>

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
                  <Play className="size-4" /> Demo Langsung
                </a>
              )}
              <Link
                href={`/repo/${c.repo}`}
                className="flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 font-mono text-[11px] uppercase tracking-wider text-cream/80 transition hover:border-spotlight/50 hover:text-spotlight"
              >
                <Github className="size-4" /> Lihat Repositori
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
        <Section icon={Target} micro="01 // masalah" title="Masalah">
          <p className="text-[14.5px] leading-relaxed text-cream/70">{c.problem}</p>
        </Section>

        {/* Pendekatan */}
        <Section icon={Wrench} micro="02 // pendekatan" title="Pendekatan">
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
        <Section icon={CheckCircle2} micro="03 // hasil" title="Hasil">
          <p className="text-[14.5px] leading-relaxed text-cream/70">{c.outcome}</p>
          {repo && (
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 font-mono text-[10px] text-cream/40">
              <span>repo: <span className="text-cream/70">{repo.fullName}</span></span>
              <span>bahasa: <span className="text-cream/70">{repo.language ?? '—'}</span></span>
              <span>lisensi: <span className="text-cream/70">{repo.license ?? '—'}</span></span>
              <span className="flex items-center gap-1">
                <ExternalLink className="size-3" />
                <a href={repo.url} target="_blank" rel="noreferrer" className="text-ember/80 hover:text-ember hover:underline">
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
                <div className="micro text-[8px] text-cream/35">sebelumnya</div>
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
                <div className="micro text-[8px] text-cream/35">berikutnya</div>
                <div className="truncate text-[13.5px] text-cream/80">{next.title}</div>
              </div>
              <ArrowRight className="size-4 shrink-0 text-cream/40 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </nav>
      </div>
    </AppShell>
  );
}

function Section({
  icon: Icon,
  micro,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  micro: string;
  title: string;
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
