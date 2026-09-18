'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Activity,
  Eye,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  Languages,
  MonitorPlay,
  Package,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import { computeSummary } from '@/lib/summary';
import type { Ghevent, Snapshot } from '@/lib/types';
import { formatNumber, langColor } from '@/lib/utils';
import CategoryDonut from './CategoryDonut';

/** Ikon & warna per jenis event GitHub (feed aktivitas). */
const EVENT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  PushEvent: GitCommitHorizontal,
  CreateEvent: Sparkles,
  ReleaseEvent: Package,
  ForkEvent: GitFork,
  WatchEvent: Eye,
  IssuesEvent: Activity,
  PullRequestEvent: GitBranch,
  PublicEvent: Sparkles,
};
const EVENT_COLOR: Record<string, string> = {
  PushEvent: 'text-ember',
  CreateEvent: 'text-spotlight',
  ReleaseEvent: 'text-success',
  ForkEvent: 'text-cream/60',
  WatchEvent: 'text-warn',
  IssuesEvent: 'text-ember',
  PullRequestEvent: 'text-spotlight',
  PublicEvent: 'text-success',
};

/*
 * DashboardMetrics — metrik aktivitas terintegrasi:
 * ringkasan statistik, commit heatmap 26 minggu, distribusi bahasa,
 * grafik aktivitas 30 hari, top repositori, dan feed aktivitas terbaru.
 */

export default function DashboardMetrics({ snapshot }: { snapshot: Snapshot }) {
  const s = useMemo(() => computeSummary(snapshot), [snapshot]);

  const stats: Array<{ icon: React.ComponentType<{ className?: string }>; label: string; value: number; hint?: string }> = [
    { icon: FolderGit2, label: 'Repositori publik', value: s.totalRepos, hint: `${s.originalRepos} original` },
    { icon: Star, label: 'Total stars', value: s.totalStars },
    { icon: GitBranch, label: 'Total forks', value: s.totalForks },
    { icon: Users, label: 'Pengikut', value: s.followers },
    { icon: Timer, label: 'Aktif 90 hari', value: s.activeLast90d, hint: 'repo dengan push' },
    { icon: MonitorPlay, label: 'Demo langsung', value: s.withLiveDemo, hint: 'punya homepage' },
  ];

  const topRepos = useMemo(
    () => [...snapshot.repos].sort((a, b) => b.stars - a.stars || +new Date(b.pushedAt) - +new Date(a.pushedAt)).slice(0, 5),
    [snapshot.repos],
  );
  const recent = useMemo(() => snapshot.events.slice(0, 5), [snapshot.events]);

  return (
    <div>
      {/* Statistik utama */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((st, i) => (
          <motion.div
            key={st.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-cream/45">
              <st.icon className="size-3.5 text-ember" />
              <span className="micro text-[8.5px]">{st.label}</span>
            </div>
            <div className="mt-2.5 font-display text-[30px] leading-none tabular-nums text-cream">
              {formatNumber(st.value)}
            </div>
            {st.hint && <div className="mt-1.5 font-mono text-[9.5px] text-cream/35">{st.hint}</div>}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* Heatmap */}
        <Panel
          className="lg:col-span-7"
          icon={GitCommitHorizontal}
          micro="peta commit · 26 minggu"
          aside={`${s.commitsLast4Weeks} push (4 mgg terakhir)`}
        >
          <CommitHeatmap events={snapshot.events} />
        </Panel>

        {/* Bahasa */}
        <Panel
          className="lg:col-span-5"
          icon={Languages}
          micro="bahasa paling sering digunakan"
          aside={s.mostUsedLanguage ?? '—'}
        >
          <LanguageBars counts={s.languageCounts} />
        </Panel>

        {/* Aktivitas 30 hari */}
        <Panel
          className="lg:col-span-5"
          icon={Activity}
          micro="aktivitas publik · 30 hari"
          aside={`${s.eventsLast30d} event`}
        >
          <ActivityBars events={snapshot.events} />
        </Panel>

        {/* Donat kategori */}
        <Panel className="lg:col-span-7" icon={Trophy} micro="repo teratas & aktivitas terbaru" aside="langsung dari github">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              {topRepos.map((r, i) => (
                <Link
                  key={r.name}
                  href={`/repo/${r.name}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:border-ember/30"
                >
                  <span className="w-5 font-mono text-[11px] text-cream/30">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-cream/85 group-hover:text-cream">
                    {r.name}
                  </span>
                  {r.language && (
                    <span className="size-2 shrink-0 rounded-full" style={{ background: langColor(r.language) }} />
                  )}
                  <span className="flex shrink-0 items-center gap-1 font-mono text-[10.5px] text-cream/50">
                    <Star className="size-3 text-warn" />
                    {formatNumber(r.stars)}
                  </span>
                </Link>
              ))}
            </div>
            <div className="space-y-1.5">
              {recent.map((e) => {
                const EvIcon = EVENT_ICON[e.type] ?? Activity;
                const evColor = EVENT_COLOR[e.type] ?? 'text-ember';
                return (
                  <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
                    <span className={`grid size-7 shrink-0 place-items-center rounded-lg bg-white/[0.04] ${evColor}`}>
                      <EvIcon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] text-cream/80">{e.summary}</div>
                      <div className="truncate font-mono text-[9.5px] text-cream/35">{e.repo}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        {/* Distribusi kategori */}
        <Panel className="lg:col-span-12" icon={Languages} micro="kategorisasi otomatis · seluruh repositori" aside={`${s.totalRepos} repo`}>
          <CategoryDonut counts={s.categoryCounts} total={s.totalRepos} />
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  className,
  icon: Icon,
  micro,
  aside,
  children,
}: {
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  micro: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm ${className ?? ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="micro flex items-center gap-2 text-cream/50">
          <Icon className="size-3.5 text-ember" />
          {micro}
        </div>
        {aside && (
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-cream/35">{aside}</span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* --------------------------- Commit heatmap ------------------------------ */

function CommitHeatmap({ events }: { events: Ghevent[] }) {
  const WEEKS = 26;

  const { columns, monthLabels } = useMemo(() => {
    const perDay = new Map<string, number>();
    for (const e of events) {
      const key = e.createdAt.slice(0, 10);
      perDay.set(key, (perDay.get(key) ?? 0) + 1);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisSunday = new Date(today);
    thisSunday.setDate(today.getDate() - today.getDay());
    const start = new Date(thisSunday);
    start.setDate(thisSunday.getDate() - (WEEKS - 1) * 7);

    const cols: Array<Array<{ key: string; count: number; future: boolean }>> = [];
    const labels: Array<{ col: number; label: string }> = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const col: Array<{ key: string; count: number; future: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start);
        dt.setDate(start.getDate() + w * 7 + d);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        col.push({ key, count: perDay.get(key) ?? 0, future: dt > today });
      }
      const m = new Date(start);
      m.setDate(start.getDate() + w * 7);
      if (m.getMonth() !== lastMonth) {
        lastMonth = m.getMonth();
        labels.push({ col: w, label: m.toLocaleDateString('id-ID', { month: 'short' }) });
      }
      cols.push(col);
    }
    return { columns: cols, monthLabels: labels };
  }, [events]);

  const levelColor = (count: number, future: boolean) => {
    if (future) return 'rgba(242,236,223,0.02)';
    if (count === 0) return 'rgba(242,236,223,0.055)';
    if (count === 1) return 'rgba(224,90,30,0.30)';
    if (count === 2) return 'rgba(224,90,30,0.52)';
    if (count <= 4) return 'rgba(224,90,30,0.74)';
    return '#e05a1e';
  };

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-[3px] pt-[18px]">
          {['Min', '', 'Sen', '', 'Rab', '', 'Jum', ''].map((d, i) => (
            <span key={i} className="grid h-[11px] font-mono text-[8px] leading-[11px] text-cream/30">
              {d}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto codex-scroll">
          <div className="flex min-w-[420px]">
            <div className="flex gap-[3px]">
              {columns.map((col, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {col.map((c) => (
                    <div
                      key={c.key}
                      title={c.future ? '' : `${c.count} aktivitas · ${c.key}`}
                      className="size-[11px] rounded-[3px]"
                      style={{ background: levelColor(c.count, c.future) }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="relative mt-1.5 h-3 font-mono text-[8px] text-cream/30">
            {monthLabels.map((l) => (
              <span
                key={`${l.col}-${l.label}`}
                className="absolute -translate-x-1/2"
                style={{ left: `${((l.col + 0.5) / WEEKS) * 100}%` }}
              >
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[8.5px] text-cream/35">
        sedikit
        {[0, 1, 2, 4, 6].map((c) => (
          <span key={c} className="size-[10px] rounded-[3px]" style={{ background: levelColor(c, false) }} />
        ))}
        banyak
      </div>
    </div>
  );
}

/* ----------------------------- Language bars ----------------------------- */

function LanguageBars({ counts }: { counts: { lang: string; count: number }[] }) {
  const top = counts.slice(0, 8);
  const max = Math.max(1, ...top.map((c) => c.count));
  return (
    <div className="space-y-2.5">
      {top.map((c, i) => (
        <div key={c.lang} className="flex items-center gap-3">
          <span className="w-24 truncate font-mono text-[11px] text-cream/70">{c.lang}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(c.count / max) * 100}%` }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: langColor(c.lang), boxShadow: `0 0 12px -2px ${langColor(c.lang)}88` }}
            />
          </div>
          <span className="w-8 text-right font-mono text-[11px] tabular-nums text-cream/50">{c.count}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- Activity bars ----------------------------- */

function ActivityBars({ events }: { events: Ghevent[] }) {
  const DAYS = 30;
  const { bars, peak } = useMemo(() => {
    const perDay = new Array<number>(DAYS).fill(0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (const e of events) {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((now.getTime() - d.getTime()) / 86_400_000);
      if (diff >= 0 && diff < DAYS) perDay[DAYS - 1 - diff] += 1;
    }
    const max = Math.max(1, ...perDay);
    const peakIdx = perDay.indexOf(max);
    const peakDate = new Date(now);
    peakDate.setDate(now.getDate() - (DAYS - 1 - peakIdx));
    return { bars: perDay, peak: { count: max, label: peakDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) } };
  }, [events]);

  const max = Math.max(1, ...bars);

  return (
    <div>
      <svg viewBox={`0 0 ${DAYS * 10} 64`} className="w-full" role="img" aria-label="Grafik aktivitas 30 hari">
        {bars.map((b, i) => {
          const h = Math.max(2, (b / max) * 54);
          return (
            <rect
              key={i}
              x={i * 10 + 2}
              y={60 - h}
              width={6}
              height={h}
              rx={2}
              fill={b === 0 ? 'rgba(242,236,223,0.08)' : b === max ? '#e05a1e' : '#f07f45'}
              opacity={b === 0 ? 1 : 0.4 + 0.6 * (b / max)}
            >
              <title>{`${b} aktivitas`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between font-mono text-[9.5px] text-cream/35">
        <span>30 hari lalu</span>
        <span>
          puncak: <span className="text-ember-soft">{peak.count}</span> · {peak.label}
        </span>
        <span>hari ini</span>
      </div>
    </div>
  );
}
