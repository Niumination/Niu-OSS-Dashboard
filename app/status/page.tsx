import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity, ArrowLeft, Globe, Timer } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { getGithubSnapshot } from '@/lib/github';
import { UPTIME_DATA } from '@/lib/uptime-data';
import { avgMs, dayColor, lastCheck, lastIncident, overall, uptimePct } from '@/lib/uptime';
import { hostOf, timeAgo } from '@/lib/utils';
import T from '@/components/T';

// Statik murni tanpa ISR: regenerasi ISR di Vercel pernah mencampur generasi
// render (DOM segar vs payload flight RSC basi) sehingga hydration gagal
// (React #418) di semua halaman. Data diperbarui per deploy — cron mingguan
// refresh-data push data baru -> auto-redeploy. Lihat CHANGELOG [Stack 2026.1].

export const metadata: Metadata = {
  title: 'Halaman Status',
  description:
    'Berapa situs ekosistem Niumination yang sedang hidup — dicek otomatis tiap 15 menit via GitHub Actions, riwayatnya bisa diaudit publik.',
  alternates: { canonical: '/status' },
};

/**
 * Halaman status publik (ala Upptime): membaca riwayat uptime ter-commit
 * (data/uptime.json) — riwayat 30 hari, uptime %, waktu respons, insiden.
 */
export default async function StatusPage() {
  const snap = await getGithubSnapshot();
  const ov = overall(UPTIME_DATA);

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <Link
          href="/system"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cream/50 transition-colors hover:text-ember"
        >
          <ArrowLeft className="size-3.5" /> <T k="status.back" />
        </Link>

        <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="micro flex items-center gap-2 text-cream/45">
              <span className="size-1.5 rounded-full bg-ember" />
              <T k="status.micro" />
            </div>
            <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
              <T k="status.title" />
            </h1>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-cream/60">
              <T k="status.desc" vars={{ interval: UPTIME_DATA.intervalMinutes }} />
            </p>
          </div>
          <div
            className={`flex items-center gap-3 rounded-full border px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider ${
              ov.up === ov.sites
                ? 'border-success/30 bg-success/10 text-success'
                : ov.up === 0
                  ? 'border-danger/30 bg-danger/10 text-danger'
                  : 'border-warn/30 bg-warn/10 text-warn'
            }`}
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-current" />
            </span>
            <T k="status.badge" vars={{ up: ov.up, sites: ov.sites }} />
          </div>
        </header>

        {/* Ringkasan */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label={<T k="status.card.uptime30" />}
            value={`${ov.uptime30d.toFixed(2)}%`}
            icon={Globe}
          />
          <StatCard label={<T k="status.card.sites" />} value={String(ov.sites)} icon={Activity} />
          <StatCard
            label={<T k="status.card.interval" />}
            value={<T k="status.interval" vars={{ n: UPTIME_DATA.intervalMinutes }} />}
            icon={Timer}
          />
          <StatCard
            label={<T k="status.card.updated" />}
            value={timeAgo(UPTIME_DATA.updatedAt)}
            icon={Activity}
          />
        </div>

        {/* Per situs */}
        <div className="mt-6 space-y-3">
          {UPTIME_DATA.sites.map((s) => {
            const lc = lastCheck(s);
            const up7 = uptimePct(s, 7);
            const up30 = uptimePct(s, 30);
            const ms = avgMs(s, 30);
            const inc = lastIncident(s);
            return (
              <section
                key={s.repo}
                className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${
                      lc?.ok ? 'bg-success shadow-[0_0_10px_rgba(61,220,151,0.8)]' : 'bg-danger'
                    }`}
                    aria-hidden="true"
                  />
                  <Link
                    href={`/repo/${s.repo}`}
                    className="font-mono text-[13.5px] text-cream transition-colors hover:text-ember-soft"
                  >
                    {s.repo}
                  </Link>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate font-mono text-[10px] text-cream/35 transition-colors hover:text-spotlight"
                  >
                    {hostOf(s.url)}
                  </a>
                  <span
                    className={`ml-auto font-mono text-[10px] uppercase tracking-wider ${
                      lc?.ok ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {lc?.ok ? <T k="status.site.up" /> : <T k="status.site.down" />}
                    {lc?.ms != null ? ` · ${lc.ms} ms` : ''}
                  </span>
                </div>

                {/* Strip 30 hari */}
                <div className="mt-4 flex items-end gap-[3px]" aria-hidden="true">
                  {s.days.slice(-30).map((d) => (
                    <span
                      key={d.d}
                      title={`${d.d}: ${d.ok}/${d.n} ok${d.ms ? ` · ${d.ms} ms` : ''}`}
                      className="h-8 flex-1 rounded-[3px]"
                      style={{ background: dayColor(d.ok / Math.max(1, d.n)) }}
                    />
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] text-cream/40">
                  <span>
                    <T k="status.d7" />: <span className="text-cream/75">{up7.toFixed(1)}%</span>
                  </span>
                  <span>
                    <T k="status.d30" />: <span className="text-cream/75">{up30.toFixed(1)}%</span>
                  </span>
                  <span>
                    <T k="status.avg" />: <span className="text-cream/75">{ms != null ? `${ms} ms` : '—'}</span>
                  </span>
                  <span>
                    <T k="status.lastInc" />: <span className="text-cream/75">{inc ?? <T k="status.none" />}</span>
                  </span>
                </div>
              </section>
            );
          })}
        </div>

        <p className="mt-6 font-mono text-[9.5px] leading-relaxed text-cream/30">
          <T k="status.note" />
        </p>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-cream/45">
        <Icon className="size-3.5 text-ember" />
        <span className="micro text-[8.5px]">{label}</span>
      </div>
      <div className="mt-2 truncate font-display text-[24px] tabular-nums text-cream">{value}</div>
    </div>
  );
}
