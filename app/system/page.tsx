import type { Metadata } from 'next';
import { Activity, Radio } from 'lucide-react';
import AppShell from '@/components/AppShell';
import DashboardMetrics from '@/components/DashboardMetrics';
import StatusMonitor from '@/components/StatusMonitor';
import { getGithubSnapshot } from '@/lib/github';
import { computeSummary } from '@/lib/summary';
import { formatDate, timeAgo } from '@/lib/utils';

// Nilai statis (persyaratan parser config Next). Pada static export semua
// halaman memang dirender statis, jadi revalidate tidak berdampak apa pun.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'System & Metrics',
  description:
    'Metrik aktivitas GitHub Niumination — commit heatmap, distribusi bahasa, aktivitas 30 hari, dan monitor status deployment live.',
  alternates: { canonical: '/system' },
};

export default async function SystemPage() {
  const snap = await getGithubSnapshot();
  const s = computeSummary(snap);

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="micro flex items-center gap-2 text-cream/45">
              <span className="size-1.5 rounded-full bg-ember" />
              04 // system & metrics
            </div>
            <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
              System & Metrics
            </h1>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-cream/60">
              Kesehatan ekosistem: statistik agregat, commit heatmap, bahasa dominan, dan status
              deployment yang sedang tayang.
            </p>
          </div>
          <div
            className={`flex items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-wider ${
              snap.live
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-warn/30 bg-warn/10 text-warn'
            }`}
            title={snap.source}
          >
            <Radio className={`size-3.5 ${snap.live ? 'animate-breathe' : ''}`} />
            {snap.live
              ? `live · github api · ${timeAgo(snap.updatedAt)}`
              : `fallback snapshot · ${formatDate(snap.updatedAt)}${snap.rateLimited ? ' · rate-limited' : ''}`}
          </div>
        </header>

        <div className="mt-8">
          <DashboardMetrics snapshot={snap} />
        </div>

        <StatusMonitor deployments={s.deployments} />

        <div className="mt-6 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-cream/30">
          <Activity className="size-3 text-ember" />
          heatmap & aktivitas dihitung dari Events API publik (maks 90 hari, 300 event)
        </div>
      </div>
    </AppShell>
  );
}
