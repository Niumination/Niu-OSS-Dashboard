import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { getGithubSnapshot } from '@/lib/github';
import { CASE_STUDIES } from '@/lib/case-studies';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Studi Kasus',
  description:
    'Tiga proyek pilihan dibedah: masalah, pendekatan, dan hasil — civic tech, terminal AI 7 MB, dan OS AI-first.',
  alternates: { canonical: '/studies' },
};

export default async function StudiesPage() {
  const snap = await getGithubSnapshot();

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <header>
          <div className="micro flex items-center gap-2 text-cream/45">
            <span className="size-1.5 rounded-full bg-ember" />
            06 // studi kasus
          </div>
          <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
            Studi Kasus
          </h1>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-cream/60">
            Bukan sekadar daftar proyek — tiga karya dibedah dari masalah, pendekatan, sampai
            hasilnya. Semua kode terbuka dan bisa diaudit langsung.
          </p>
        </header>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {CASE_STUDIES.map((c, i) => (
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
                    <span key={s} className="rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[9px] text-cream/45">
                      {s}
                    </span>
                  ))}
                </div>
                <ArrowRight className="size-4 shrink-0 text-cream/40 transition-all group-hover:translate-x-0.5 group-hover:text-ember" />
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 flex items-center gap-2 font-mono text-[10px] text-cream/35">
          <ExternalLink className="size-3" />
          semua studi berbasis repositori publik — klaim bisa diverifikasi dari kodenya.
        </p>
      </div>
    </AppShell>
  );
}
