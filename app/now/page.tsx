import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, GitBranch, History } from 'lucide-react';
import AppShell from '@/components/AppShell';
import TitleSync from '@/components/TitleSync';
import T from '@/components/T';
import { getGithubSnapshot } from '@/lib/github';
import { computeNow, shortDay } from '@/lib/now';

// Statik murni tanpa ISR (pelajaran React #418 — lihat catatan di app/studies/page.tsx).
// Data events dibekukan per-deploy; penyegaran mengikuti push data / deploy baru.

export const metadata: Metadata = {
  title: 'Sekarang',
  description:
    'Apa yang sedang dikerjakan Niumination saat ini — repo paling aktif 30 hari terakhir dan linimasa aktivitas terbaru, langsung dari event publik GitHub.',
  alternates: { canonical: '/now' },
};

export default async function NowPage() {
  const snap = await getGithubSnapshot();
  const { focus, timeline, updatedAt } = computeNow(snap);

  return (
    <AppShell snapshot={snap}>
      <TitleSync k="title.now" />
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <header>
          <div className="micro flex items-center gap-2 text-cream/45">
            <span className="size-1.5 rounded-full bg-ember" />
            <T k="now.micro" />
          </div>
          <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
            <T k="now.title" />
          </h1>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-cream/60">
            <T k="now.desc" />
          </p>
        </header>

        {/* ── fokus: repo aktif ─────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-cream/50">
            <GitBranch className="size-3.5 text-ember" />
            <T k="now.focus.title" />
          </h2>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-cream/45">
            <T k="now.focus.sub" />
          </p>

          {focus.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 text-[13px] text-cream/50">
              <T k="now.empty" />
            </p>
          ) : (
            <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {focus.map((r) => (
                <li key={r.repo}>
                  <Link
                    href={`/repo/${r.repo.split('/')[1]?.toLowerCase() ?? ''}`}
                    className="group flex h-full flex-col gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-ember/40 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-mono text-[12.5px] text-cream/85 group-hover:text-cream">
                        {r.repo.split('/')[1] ?? r.repo}
                      </span>
                      <ArrowUpRight className="size-3.5 shrink-0 text-cream/40 transition group-hover:text-ember" />
                    </div>
                    <div className="mt-auto flex items-baseline justify-between font-mono text-[10px] text-cream/40">
                      <span>
                        <span className="text-cream/75">{r.pushes}</span>{' '}
                        <T k="now.repo.pushes" /> · {shortDay(r.lastAt.slice(0, 10))}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── linimasa ─────────────────────────────────────────────────── */}
        {timeline.length > 0 && (
          <section className="mt-14">
            <h2 className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-cream/50">
              <History className="size-3.5 text-ember" />
              <T k="now.activity.title" />
            </h2>
            <div className="mt-6 space-y-8">
              {timeline.map((d) => (
                <div key={d.date} className="grid gap-4 md:grid-cols-[110px_1fr]">
                  <div className="font-mono text-[10.5px] uppercase tracking-wider text-cream/40">
                    {shortDay(d.date)}
                  </div>
                  <ul className="space-y-1.5">
                    {d.items.map((it, i) => (
                      <li
                        key={`${it.repo}-${i}`}
                        className="flex flex-wrap items-baseline gap-x-2 text-[13px] leading-relaxed text-cream/60"
                      >
                        <a
                          href={it.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11.5px] text-cream/85 underline-offset-4 hover:text-ember hover:underline"
                        >
                          {it.repo.split('/')[1] ?? it.repo}
                        </a>
                        <span className="text-cream/45">{it.summary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 font-mono text-[10px] text-cream/35">
          <T k="now.updated" />
        </p>
      </div>
    </AppShell>
  );
}
