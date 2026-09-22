import type { Metadata } from 'next';
import { Activity, Radio } from 'lucide-react';
import AppShell from '@/components/AppShell';
import DashboardMetrics from '@/components/DashboardMetrics';
import StatusMonitor from '@/components/StatusMonitor';
import { getGithubSnapshot } from '@/lib/github';
import { computeSummary } from '@/lib/summary';
import { getContributions } from '@/lib/insights';
import InsightsPanel from '@/components/InsightsPanel';
import { UPTIME_DATA } from '@/lib/uptime-data';
import { formatDate, timeAgo } from '@/lib/utils';
import T from '@/components/T';

// Nilai statis (persyaratan parser config Next). Pada static export semua
// halaman memang dirender statis, jadi revalidate tidak berdampak apa pun.
// Statik murni tanpa ISR: regenerasi ISR di Vercel pernah mencampur generasi
// render (DOM segar vs payload flight RSC basi) sehingga hydration gagal
// (React #418) di semua halaman. Data diperbarui per deploy — cron mingguan
// refresh-data push data baru -> auto-redeploy. Lihat CHANGELOG [Stack 2026.1].

export const metadata: Metadata = {
  title: 'Sistem & Metrik',
  description:
    'Denyut nadi ekosistem Niumination: peta commit 26 minggu, bahasa favorit, aktivitas 30 hari, dan situs yang sedang hidup.',
  alternates: { canonical: '/system' },
};

export default async function SystemPage() {
  const snap = await getGithubSnapshot();
  const s = computeSummary(snap);
  const contributions = await getContributions(snap);

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="micro flex items-center gap-2 text-cream/45">
              <span className="size-1.5 rounded-full bg-ember" />
              <T k="sys.micro" />
            </div>
            <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
              <T k="sys.title" />
            </h1>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-cream/60">
              <T k="sys.desc" />
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
            {snap.live ? (
              <T k="sys.live" vars={{ ago: timeAgo(snap.updatedAt) }} />
            ) : (
              <>
                <T k="sys.snap" vars={{ date: formatDate(snap.updatedAt) }} />
                {snap.rateLimited && <T k="sys.snapLimited" />}
                <a
                  href="/api/github/summary"
                  className="ml-1 underline decoration-warn/40 underline-offset-4 transition-colors hover:decoration-warn"
                  title="Data GitHub termutakhir (API live, ISR 5 menit)"
                >
                  live ↗
                </a>
              </>
            )}
          </div>
        </header>

        <div className="mt-8">
          <DashboardMetrics snapshot={snap} />
        </div>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="micro flex items-center gap-2 text-cream/45">
                <span className="size-1.5 rounded-full bg-ember" />
                <T k="sys.insight.micro" />
              </div>
              <h2 className="mt-2 font-display text-[30px] tracking-tight md:text-[38px]">
                <T k="sys.insight.title" />
              </h2>
            </div>
          </div>
          <div className="mt-6">
            <InsightsPanel data={contributions} />
          </div>
        </section>

        <StatusMonitor deployments={s.deployments} history={UPTIME_DATA} />

        <div className="mt-6 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-cream/30">
          <Activity className="size-3 text-ember" />
          <T k="sys.foot" />
        </div>
      </div>
    </AppShell>
  );
}
