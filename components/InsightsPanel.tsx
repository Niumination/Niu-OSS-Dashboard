'use client';

import { motion } from 'framer-motion';
import { BarChart3, CalendarDays, Flame, Info } from 'lucide-react';
import type { Contributions } from '@/lib/insights';
import { formatNumber } from '@/lib/utils';

/*
 * InsightsPanel — kontribusi ala OSS Insight:
 * total setahun, grafik 12 bulan, distribusi hari-dalam-minggu,
 * dan repo paling aktif. Data: lib/insights.ts (GraphQL / fallback events).
 */

const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function InsightsPanel({ data }: { data: Contributions }) {
  const maxMonth = Math.max(1, ...data.months.map((m) => m.count));
  const maxDow = Math.max(1, ...data.byDayOfWeek);
  const maxRepo = Math.max(1, ...data.topRepos.map((r) => r.count));
  const bestDow = data.byDayOfWeek.indexOf(maxDow);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Grafik 12 bulan */}
      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="micro flex items-center gap-2 text-cream/50">
            <BarChart3 className="size-3.5 text-ember" />
            kontribusi · 12 bulan
          </div>
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-cream/35">
            {formatNumber(data.total)} total
            {data.source === 'graphql' ? ' · setahun penuh' : ' · ±90 hari (events)'}
          </span>
        </div>

        <div className="mt-5 flex h-40 items-end gap-1.5">
          {data.months.map((m, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(2, (m.count / maxMonth) * 100)}%` }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                title={`${m.label}: ${m.count} kontribusi`}
                className="w-full rounded-t-md"
                style={{
                  background:
                    m.count === maxMonth && m.count > 0
                      ? '#e05a1e'
                      : 'rgba(240,127,69,0.35)',
                  minHeight: 3,
                }}
              />
              <span className="truncate font-mono text-[8px] text-cream/35">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:col-span-5">
        {/* Hari paling produktif */}
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="micro flex items-center gap-2 text-cream/50">
            <CalendarDays className="size-3.5 text-ember" />
            ritme mingguan
          </div>
          <div className="mt-4 flex h-24 items-end gap-2">
            {data.byDayOfWeek.map((n, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(3, (n / maxDow) * 100)}%` }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.45 }}
                  title={`${DOW[i]}: ${n}`}
                  className="w-full rounded-t-md"
                  style={{
                    background: i === bestDow ? '#00e5ff' : 'rgba(0,229,255,0.25)',
                    minHeight: 3,
                  }}
                />
                <span className="font-mono text-[8px] text-cream/35">{DOW[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[9.5px] text-cream/35">
            hari tersibuk: <span className="text-spotlight">{DOW[bestDow]}</span>
          </p>
        </section>

        {/* Repo paling aktif */}
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="micro flex items-center gap-2 text-cream/50">
            <Flame className="size-3.5 text-ember" />
            repo paling aktif
          </div>
          <ul className="mt-4 space-y-2.5">
            {data.topRepos.map((r) => (
              <li key={r.repo} className="flex items-center gap-3">
                <span className="w-28 truncate font-mono text-[10.5px] text-cream/65">
                  {r.repo.split('/')[1] ?? r.repo}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.count / maxRepo) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-ember"
                  />
                </div>
                <span className="w-8 text-right font-mono text-[10.5px] tabular-nums text-cream/50">
                  {r.count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {data.source === 'events' && (
        <p className="flex items-start gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 font-mono text-[9.5px] leading-relaxed text-cream/35 lg:col-span-12">
          <Info className="mt-0.5 size-3.5 shrink-0 text-warn/70" />
          Insight dihitung dari Events API publik (±90 hari terakhir). Pasang GITHUB_TOKEN untuk
          kalender kontribusi penuh 12 bulan via GraphQL.
        </p>
      )}
    </div>
  );
}
